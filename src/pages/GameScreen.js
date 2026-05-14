import React, { useState, useEffect, useMemo, useRef } from "react";
import PhaseHeader from "../components/PhaseHeader";
import WordBoard from "../components/WordBoard";
import ClueInput from "../components/ClueInput";
import GuessPanel from "../components/GuessPanel";
import PlayerList from "../components/PlayerList";
import ChatBox from "../components/ChatBox";
import HexagonBox from "../components/HexagonBox";
import fightBg from "../assets/IMAGES/gs.png";
import PlayerProfiles from "../components/PlayerProfiles";

// ----- helpers -----
const assignTeamsToWords = () => {
  const pool = [
    ...Array(9).fill("blue"),
    ...Array(8).fill("orange"),
    ...Array(6).fill("neutral"),
    "white",
    "Jester",
  ].sort(() => Math.random() - 0.5);

  return Array.from({ length: 25 }, (_, i) => ({
    id: i,
    word: `Word${i + 1}`,
    revealed: false,
    team: pool[i],
    votes: [], // per-round votes (playerIds)
    resolved: false, // has this tile already had its outcome applied?
  }));
};

const opponentOf = (t) => (t === "blue" ? "orange" : "blue");
const CapTeam = (t) => (t === "blue" ? "Blue" : "Orange");
// place this near the top of GameScreen.js with other helper functions
function getMajorityThreshold(playerCount) {
  if (playerCount <= 1) return 1;        // solo / test mode
  return Math.floor(playerCount / 2) + 1; // 50% + 1 for even counts, correct for odd too
}

export default function GameScreen() {
  // --- tester profiles (single source of truth) ---
  const [profiles, setProfiles] = useState([
    { id: 1, name: "You", team: "blue", role: "Guesser" },
    { id: 2, name: "Alex", team: "orange", role: "Guesser" },
    { id: 3, name: "Sam", team: "blue", role: "WordMaster" },
    { id: 4, name: "Lara", team: "orange", role: "WordMaster" },
    { id: 5, name: "Jordan", team: "blue", role: "Jester" }
  ]);
  // After profiles state
const [trapWords, setTrapWords] = useState(() => {
  const obj = {};
  profiles.forEach(p => {
    if (p.role === "Jester") {
      const unrevealed = Array.from({ length: 25 }, (_, i) => i);
      const randomIndex = unrevealed[Math.floor(Math.random() * unrevealed.length)];
      obj[p.id] = randomIndex; // store by Jester’s playerId
    }
  });
  return obj; // {playerId: wordIndex}
});

  const [currentUser, setCurrentUser] = useState(profiles[0]);
  const [trapWord, setTrapWord] = useState(null);

  // --- board + game state ---
  const [words, setWords] = useState(assignTeamsToWords);
  const [phase, setPhase] = useState("Clue Phase");
  const [currentTeam, setCurrentTeam] = useState("blue");
  const [blueScore, setBlueScore] = useState(9);
  const [orangeScore, setOrangeScore] = useState(8);

  // clue: (count == votes per player)
  const [clue, setClue] = useState({ word: "", count: 0 });
  const [guessRemaining, setGuessRemaining] = useState(0);

  // timers
  const [blueTime, setBlueTime] = useState(90);
  const [orangeTime, setOrangeTime] = useState(90);

  // guard to avoid double draw-processing per clue
  const drawHandledRef = useRef(false);
const resolutionLockRef = useRef(false);
  // --- derived flags ---
  const gameOver = phase.includes("Wins");

  const canGiveClue = useMemo(
    () =>
      phase === "Clue Phase" &&
      currentUser.role === "WordMaster" &&
      currentUser.team === currentTeam &&
      !gameOver,
    [phase, currentUser, currentTeam, gameOver]
  );

  const canClickBoard = useMemo(
    () =>
      phase === "Guess Phase" &&
      currentUser.role === "Guesser" &&
      currentUser.team === currentTeam &&
      !gameOver,
    [phase, currentUser, currentTeam, gameOver]
  );

  const canConfirmGuess = useMemo(
    () =>
      phase === "Guess Phase" &&
      currentUser.role === "Guesser" &&
      currentUser.team === currentTeam &&
      !gameOver,
    [phase, currentUser, currentTeam, gameOver]
  );

  // --- timers: simple + stable ---
  useEffect(() => {
    const active = phase === "Clue Phase" || phase === "Guess Phase";
    if (!active || gameOver) return;
    const id = setInterval(() => {
      if (currentTeam === "blue") {
        setBlueTime((t) => Math.max(0, t - 1));
      } else {
        setOrangeTime((t) => Math.max(0, t - 1));
      }
    }, 1000);
    return () => clearInterval(id);
  }, [phase, currentTeam, gameOver]);

  // ----- WordMaster sends clue -----
 // ----- WordMaster sends clue -----
const onSendClue = ({ clue: clueWord, count }) => {
  if (!canGiveClue) return;

  const normalized = {
    word: String(clueWord || "").trim(),
    count: Math.max(0, Number(count) || 0),
  };

  setClue(normalized);
  setPhase("Guess Phase");
  setGuessRemaining(normalized.count);

  // 🔧 Clear per-round votes on ALL tiles (revealed or not).
  //    This prevents old profiles from being mistakenly "at cap".
  setWords(prev => prev.map(w => ({ ...w, votes: [] })));

  // (optional) if you want to keep history for leaderboard:
  // setWords(prev => prev.map(w => ({
  //   ...w,
  //   voteHistory: [...(w.voteHistory || []), ...(w.votes?.length ? [{ team: currentTeam, clue: normalized.word, votes: w.votes }] : [])],
  //   votes: []
  // })));
};




  // ----- guesser voting -----
const handleVote = (index, playerId) => {
  // block while a resolution is in-flight
  if (resolutionLockRef.current) return;

  if (phase !== "Guess Phase") return;
  if (playerId !== currentUser.id) return; // only active profile
  if (currentUser.role !== "Guesser" || currentUser.team !== currentTeam) return;

  const teamGuessers = profiles.filter((p) => p.team === currentTeam && p.role === "Guesser");
  const cap = Number(clue.count || 0);
  const majority = getMajorityThreshold(teamGuessers.length);

  let computedNext = null;
  let revealNow = false;
  let revealTeam = null;
  let revealIndex = null;

  setWords((prev) => {
    // compute usedByPlayer BEFORE modifying tiles
   const usedByPlayer = prev.reduce((acc, word) => {
  // 🔧 Do not count votes on revealed tiles (past rounds / already resolved)
  if (word.revealed) return acc;
  return acc + ((word.votes || []).includes(playerId) ? 1 : 0);
}, 0);

    if (cap > 0 && usedByPlayer >= cap) {
      // player used up votes — block
      return prev;
    }

    const next = prev.map((w, i) => {
      if (i !== index || w.revealed) return w;

      const votesHere = Array.isArray(w.votes) ? [...w.votes] : [];
      if (votesHere.includes(playerId)) return w; // duplicate vote blocked

      votesHere.push(playerId);
      const newW = { ...w, votes: votesHere };

      // majority check
      if (votesHere.length >= majority) {
        newW.revealed = true;
        revealNow = true;
        revealTeam = newW.team;
        revealIndex = i;
         resolveTileOutcome(newW.team, i);
      }
      return newW;
    });

    computedNext = next;
    return next;
  });
if (revealNow && revealTeam !== null && revealIndex !== null) {
  resolveTileOutcome(revealTeam, revealIndex);
}
  // after the state update has been queued, act on the computed snapshot
  setTimeout(() => {
    // if majority reached, resolve the exact tile (index)
    if (revealNow && revealIndex != null) {
      // call resolver with index so it can mark resolved and apply scoring exactly once
      resolveTileOutcome(revealIndex, revealTeam);
      return;
    }

    // DRAW check: use computedNext (snapshot) to determine votes used by this team's guessers
    if (computedNext) {
      const guesserIds = new Set(teamGuessers.map((g) => g.id));
      const totalAllowed = teamGuessers.length * cap;
      const votesUsed = computedNext.reduce(
        (sum, w) => sum + ((w.votes || []).filter((pid) => guesserIds.has(pid)).length),
        0
      );
      const anyRevealed = computedNext.some((w) => w.revealed);

      if (totalAllowed > 0 && votesUsed >= totalAllowed && !anyRevealed && !drawHandledRef.current) {
        drawHandledRef.current = true;
        // auto-skip to opponent
        setPhase("Clue Phase");
        setCurrentTeam(opponentOf(currentTeam));
      }
    }
  }, 0);
};



  // ----- central resolver for revealed outcome -----
const resolveTileOutcome = (index, clickedTeam) => {
  const opp = opponentOf(currentTeam);

  // 🎭 Check all Jesters
  Object.entries(trapWords).forEach(([pid, trapIndex]) => {
    const jester = profiles.find(p => p.id === Number(pid));
    if (!jester) return;

    if (trapIndex === index) {
      // opponent hit trap
      if (clickedTeam === jester.team) {
        // friendly fire → nothing happens (safe)
        return;
      }

      if (clickedTeam === opp) {
        // punish opponent → -1 score
        if (opp === "blue") setBlueScore(s => Math.max(0, s - 1));
        else setOrangeScore(s => Math.max(0, s - 1));
      } else if (clickedTeam === "neutral") {
        setPhase("Clue Phase");
        setCurrentTeam(opponentOf(opp));
      } else if (clickedTeam === "Jester") {
        setPhase(`${jester.team === "blue" ? "Blue" : "Orange"} Wins!`);
      }
    }
  });
  // avoid concurrent resolutions
  if (resolutionLockRef.current) return;
  resolutionLockRef.current = true;

  // mark the tile resolved (so subsequent calls won't re-process)
  setWords((prev) => {
    if (!prev[index]) return prev;
    // if already resolved, do nothing further
    if (prev[index].resolved) return prev;
    return prev.map((w, i) => (i === index ? { ...w, resolved: true } : w));
  });

  // apply scoring & turn changes after marking resolved
  setTimeout(() => {
    const opp = opponentOf(currentTeam);

    // Jester/Jester/white handling (your rules)
    if (clickedTeam === "Jester") {
      setPhase("Jester wins!");
      setGuessRemaining(0);
      resolutionLockRef.current = false;
      return;
    }
    if (clickedTeam === "white") {
      // white causes immediate opponent win per your rules
      setPhase(`${CapTeam(opp)} Wins!`);
      setGuessRemaining(0);
      resolutionLockRef.current = false;
      return;
    }

    // Correct team found
    if (clickedTeam === currentTeam) {
      if (currentTeam === "blue") {
        setBlueScore((s) => {
          const next = s - 1;
          if (next <= 0) setPhase("Blue Wins!");
          return next;
        });
      } else {
        setOrangeScore((s) => {
          const next = s - 1;
          if (next <= 0) setPhase("Orange Wins!");
          return next;
        });
      }

      // consume one guess budget and possibly end turn
      setGuessRemaining((g) => {
        const next = Math.max(0, (g || 0) - 1);
        if (next <= 0) {
          setPhase("Clue Phase");
          setCurrentTeam(opp);
        }
        return next;
      });

      resolutionLockRef.current = false;
      return;
    }

    // Opponent tile -> help them, subtract their remaining word and end turn
    if (clickedTeam === opp) {
      if (clickedTeam === "blue") {
        setBlueScore((s) => {
          const next = s - 1;
          if (next <= 0) setPhase("Blue Wins!");
          return next;
        });
      } else {
        setOrangeScore((s) => {
          const next = s - 1;
          if (next <= 0) setPhase("Orange Wins!");
          return next;
        });
      }
      setGuessRemaining(0);
      setPhase("Clue Phase");
      setCurrentTeam(opp);
      resolutionLockRef.current = false;
      return;
    }

    // Neutral -> end turn
    if (clickedTeam === "neutral") {
      setGuessRemaining(0);
      setPhase("Clue Phase");
      setCurrentTeam(opp);
      resolutionLockRef.current = false;
      return;
    }

    // default: release lock
    resolutionLockRef.current = false;
  }, 0);
};



  // ----- WordMaster direct reveal (for testing) -----
const handleWordClick = (index) => {
  if (currentUser.role !== "WordMaster") return;
  const tile = words[index];
  if (!tile || tile.revealed) return;

  // mark revealed immediately
  setWords((prev) => prev.map((w, i) => (i === index ? { ...w, revealed: true } : w)));


  // resolve the exact tile (index)
resolveTileOutcome(tile.team, index);
};

  // ----- manual end turn (guesser) -----
  const onConfirmGuess = () => {
    if (!canConfirmGuess) return;
    setGuessRemaining(0);
    setPhase("Clue Phase");
    setCurrentTeam((t) => opponentOf(t));
  };

  const onEndTurn = onConfirmGuess;
  
  // ----- Dev tester (unchanged, just helpful) -----
  const [testerOpen, setTesterOpen] = useState(false);
  const roleOptions = ["WordMaster", "Guesser", "Jester", "EvilGuesser"];

  const phaseLabel =
    phase === "Guess Phase"
      ? <>Guess Phase • <br/> {CapTeam(currentTeam)} Turn</>
      : phase === "Clue Phase"
      ? `${CapTeam(currentTeam)} Clue Phase`
      : phase;

  const DevRoleTester = () => (
    <div className="fixed top-4 right-4 z-60">
      <div className="flex items-center gap-2">
        <button
          onClick={() => setTesterOpen((s) => !s)}
          className="bg-black/70 text-white px-3 py-1 rounded-md border border-gray-700 text-sm shadow"
        >
          {testerOpen ? "Close Tester" : "Tester"}
        </button>
      </div>

      {testerOpen && (
        <div className="mt-2 w-64 bg-black/80 backdrop-blur border border-gray-700 rounded-lg px-3 py-3 shadow-lg text-xs text-white">
          <div className="mb-2 text-sm font-medium">Dev Role Panel</div>

          <label className="block text-[11px] mb-1 text-gray-300">Role</label>
          <select
            value={currentUser.role}
            onChange={(e) =>
              setCurrentUser((u) => ({ ...u, role: e.target.value }))
            }
            className="w-full mb-2 bg-gray-900 border border-gray-700 rounded px-2 py-1 text-lg"
          >
            {roleOptions.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>

          <label className="block text-[11px] mb-1 text-gray-300">Team</label>
          <select
            value={currentUser.team}
            onChange={(e) =>
              setCurrentUser((u) => ({ ...u, team: e.target.value }))
            }
            className="w-full mb-2 bg-gray-900 border border-gray-700 rounded px-2 py-1 text-sm"
          >
            <option value="blue">blue</option>
            <option value="orange">orange</option>
          </select>

          <div className="flex items-center gap-2 mt-1">
            <button
              onClick={() =>
                setCurrentTeam((t) => (t === "blue" ? "orange" : "blue"))
              }
              className="flex-1 bg-gray-800 border border-gray-700 px-2 py-1 rounded text-xs"
            >
              Switch Turn → {currentTeam}
            </button>
            <button
              onClick={() => {
                setWords(assignTeamsToWords());
                setBlueScore(9);
                setOrangeScore(8);
                setPhase("Clue Phase");
                setCurrentTeam("blue");
                setClue({ word: "", count: 0 });
                setGuessRemaining(0);
                drawHandledRef.current = false;
              }}
              className="bg-red-700 px-2 py-1 rounded text-xs"
            >
              Reset
            </button>
          </div>

          <div className="mt-3 text-[12px] text-gray-300">
            <div>Role: <b className="text-white">{currentUser.role}</b></div>
            <div>Team: <b className="text-white">{currentUser.team}</b></div>
            <div>Phase: <b className="text-white">{phase}</b></div>
            <div>Guess Remaining: <b className="text-white">{guessRemaining}</b></div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div
      className="w-screen min-h-screen bg-cover bg-center"
      style={{ backgroundImage: `url(${fightBg})` }}
    >
      <div className="w-full min-h-screen bg-black bg-opacity-60 text-white relative">
        <PlayerList players={profiles} variant={1} />

        <div className="max-w-7xl mx-auto pt-20 px-24">
          <PhaseHeader
            phase={phaseLabel}
            currentPlayer={currentUser.name}
            clueWord={clue.word}
            clueCount={clue.count}
            blueScore={blueScore}
            orangeScore={orangeScore}
            blueTime={blueTime}
            orangeTime={orangeTime}
            activeTeam={currentTeam}
          />

          <DevRoleTester />

          <div className="flex flex-col items-center">
            <div className="bg-white bg-opacity-10 rounded-xl p-4 shadow-lg">
    <WordBoard
  words={words}
  onWordClick={handleWordClick}
  onVote={handleVote}
  currentUserId={currentUser.id}
  disabled={!canClickBoard}
  revealAll={currentUser.role === "WordMaster"}
  isGuesser={currentUser.role === "Guesser"}
  currentUserRole={currentUser.role}   // 👈 add this
/>


            </div>

            <div className="flex items-center gap-3 pt-9">
              {currentUser.role === "WordMaster" && (
                <ClueInput onSend={onSendClue} disabled={!canGiveClue} />
              )}

              {currentUser.role === "Guesser" && (
                <GuessPanel
                  onConfirm={onConfirmGuess}
                  onCancel={onEndTurn}
                  disabled={!canConfirmGuess}
                />
              )}
            </div>
          </div>
        </div>

        <PlayerProfiles
          profiles={profiles}
          setProfiles={setProfiles}
          currentUser={currentUser}
          setCurrentUser={setCurrentUser}
        />

        <div className="fixed bottom-4 left-4">
          <ChatBox team="blue" title="Blue Team Chat" />
        </div>

        <div className="fixed bottom-4 right-4">
          <div className="mt-4 flex items-center gap-6">
            <div className="text-center">
              <div className="text-sm text-white/70 mb-1">Blue Score</div>
              <HexagonBox>{blueScore}</HexagonBox>
            </div>
            <div className="text-center">
              <div className="text-sm text-white/70 mb-1">Orange Score</div>
              <HexagonBox>{orangeScore}</HexagonBox>
            </div>
          </div>
          <ChatBox team="orange" title="Orange Team Chat" />
        </div>
      </div>
    </div>
  );
}
