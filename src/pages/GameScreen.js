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
import nlp from  "compromise";
import {generate} from "random-words";



//============= USEABLE FUNCTIONS IN LOGICS ===============
function shuffle(arr){
  for(let i= arr.length - 1; i>0 ; i--){
    const j = Math.floor(Math.random() * (i+1));
    [arr[j],arr[i]]= [arr[i],arr[j]];
  }
  return arr;
}
 function isNoun(word) {
    return nlp(word).nouns().out("array").length > 0;
  }
  function getMajorityThreshold(playerCount) {
    if (playerCount <= 1) return 1;        // solo / test mode
    return Math.floor(playerCount / 2) + 1; // 50% + 1 for even counts, correct for odd too
  }
// ----- helpers -----

const opponentOf = (t) => (t === "blue" ? "orange" : "blue");
const CapTeam = (t) => (t === "blue" ? "Blue" : "Orange");


//this might be wrong need to fix it the 
//5-> | 2 | | 1 | 1 | 1 |
//we need the array of cards having no of  voted and then select max if cant then we draw it  

export default function GameScreen() {
  // --- tester profiles (single source of truth) ---
  const [profiles, setProfiles] = useState([
    { id: 1, name: "Carry", team: "blue", role: "Guesser" ,canClick : true, maxVotes: 0},
    { id: 2, name: "Alex", team: "orange", role: "Guesser",canClick : true, maxVotes: 0 },
    { id: 3, name: "Sam", team: "blue", role: "WordMaster",canClick :false , maxVotes: 0 },
    { id: 4, name: "Lara", team: "orange", role: "WordMaster",canClick :false, maxVotes: 0 },
    { id: 5, name: "Jordan", team: "blue", role: "Jester",canClick : true, maxVotes: 0 }
  ]);

  const assignTeamsToWords = () => {
const nouns =  generate(200).filter(isNoun).slice(0,30);
    const Words = shuffle([
      ...Array(9).fill("blue"),
      ...Array(8).fill("orange"),
      ...Array(11).fill("neutral"),
      "white",
      "Jester",
    ]);
  //9+8+6+2+5
    return Array.from({ length: 30 }, (_, i) => ({
      id: i,
      word:nouns[i],
      revealed: false,
      team: Words[i],
      votes: [], // per-round votes (playerIds)
      resolved: false, // has this tile already had its outcome applied?
    }));
  };
  // After profiles state
  const [trapWords, setTrapWords] = useState(() => {
    const obj = {};
    profiles.forEach(p => {
      if (p.role === "Jester") {
        const unrevealed = Array.from({ length: 25 }, (_, i) => i);
        const randomJesterIndex = unrevealed[Math.floor(Math.random() * unrevealed.length)];
        obj[p.id] =randomJesterIndex ; // store by Jester’s playerId
      }
    });
    return obj; // {playerId: wordIndex} why not directly index why to create obj
});

//this is not perfect to having first user have the current user this will change after server.js in real user
  const [currentUser, setCurrentUser] = useState(profiles[0]);
// ----------------------------------------------------------------------------------------------------------------------
  const [trapWord, setTrapWord] = useState(null);


  // --- board + game state ---
  const [words, setWords] = useState(assignTeamsToWords);
  const [phase, setPhase] = useState("Clue Phase");
  const [currentTeam, setCurrentTeam] = useState("blue");
  const [blueScore, setBlueScore] = useState(8);
  const [orangeScore, setOrangeScore] = useState(7);

  // clue: (count == votes per player)
  const [clue, setClue] = useState({ word: "", count: 0 });
  const [guessRemaining, setGuessRemaining] = useState(0);

  // timers
  const [blueTime, setBlueTime] = useState(60);
  const [orangeTime, setOrangeTime] = useState(60);

  // guard to avoid double draw-processing per clue
  const drawHandledRef = useRef(false);
const resolutionLockRef = useRef(false);
  // --- derived flags ---
  const gameOver = phase.includes("Wins");
const [reveal, setReveal]= useState(gameOver);

///======================functions 
// -- Some bools values to check players eligiblity inside functional arguements -----
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

  //=====this is set to check the time because it time changes like her mood 
  useEffect(() => {
console.log(currentTeam);
    const active = phase === "Clue Phase" || phase === "Guess Phase";
    if (!active || gameOver) return;
    if(blueTime ===0 ||  orangeTime === 0 ) {
      setGuessRemaining(0);
      setCurrentTeam(opponentOf(currentTeam));
      console.log(currentTeam);
      setPhase("Clue Phase")
      setBlueTime(60);
      setOrangeTime(60);
      resolutionLockRef.current = false;
      return;
    }
    const id = setInterval(() => {
      if (currentTeam === "blue") {
        setBlueTime((t) => Math.max(0, t - 1));
      console.log("i am blue time");
      } else {
        setOrangeTime((t) => Math.max(0, t - 1));
        console.log("i am ornage time ");
      }
    }, 1000);
    return () => clearInterval(id);
  }, [phase, currentTeam, gameOver,blueTime,orangeTime]);     

// ----------------------------------------------------------------------------------------------------------------------
                  // ----- WordMaster sends clue -----
// ----------------------------------------------------------------------------------------------------------------------

 const onSendClue = ({ clue: clueWord, count }) => {
  if (!canGiveClue) return;

  const normalized = {
    word: String(clueWord || "").trim(),
    count: Math.max(0, Number(count) || 0),
  };

  setClue(normalized);
  setPhase("Guess Phase");
  setGuessRemaining(normalized.count);
  if(currentTeam === "blue"){
    setBlueTime(10);
  }
  else{
  setOrangeTime(10)
  }
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


  
// ----------------------------------------------------------------------------------------------------------------------
            // ----- guesser voting -----
// ----------------------------------------------------------------------------------------------------------------------

const handleVote = (index, playerId) => {
  // block while a resolution is in-flight
  //-----Checking elegiblity to enter function ----
  if(profiles[playerId-1].maxVotes >= clue.count) return ;
  setProfiles((prev)=>(
    prev.map((p)=> {
     if(p.id == playerId) {
      return {...p, maxVotes: p.maxVotes + 1} ;
     }
     else {
      return p ;
     }}))  
  )
  
  if (resolutionLockRef.current) return;
  const tile = words[index];
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
  //do not count votes on revealed tiles (past rounds / already resolved)
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
      
      console.log("w=>"+w +"votes here => "+ votesHere)
      // majority check
      if (votesHere.length >= majority) {
        newW.revealed = true;
        revealNow = true;
        revealTeam = newW.team;
        revealIndex = i;
        resolveTileOutcome(newW.team, i);
      }
      console.log(newW);
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

// -----------------------------------------------------------------------------------------------------------------------
          // ----- central resolver for revealed outcome -----
// ----------------------------------------------------------------------------------------------------------------------

const resolveTileOutcome = (index, clickedTeam) => {
  if(profiles[currentUser.id-1].maxVotes >= clue.count) return ;

  const opp = opponentOf(currentTeam);
console.log(clickedTeam,opp,currentTeam);
  // Check all Jesters
  Object.entries(trapWords).forEach(([pid, trapIndex]) => {
    const jester = profiles.find(p => p.id === Number(pid));//this 
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
        setBlueTime(10);
        setBlueScore((s) => {
          const next = s - 1;
          if (next <= 0) setPhase("Blue Wins!");
          return next;
        });
      } else {
        setOrangeTime(10);
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
        setBlueTime(30);
        setBlueScore((s) => {
          const next = s - 1;
          if (next <= 0) setPhase("Blue Wins!");
          return next;
        });
      } else {
        setOrangeTime(30);
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


// ----------------------------------------------------------------------------------------------------------------------
      // ----- WordMaster direct reveal (for testing) -----
// ----------------------------------------------------------------------------------------------------------------------


const handleWordClick = (index) => {
  if(profiles[currentUser.id-1].maxVotes >= clue.count) return ;

  if (currentUser.role !== "WordMaster") {
    console.log("427");
    return;}
  console.log("432");
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


// ----------------------------------------------------------------------------------------------------------------------
      // ----- Dev tester (unchanged, just helpful) -----
// ----------------------------------------------------------------------------------------------------------------------


  const [testerOpen, setTesterOpen] = useState(false);
  const roleOptions = ["WordMaster", "Guesser", "Jester", "EvilGuesser"];

  const phaseLabel =
    phase === "Guess Phase"
      ? <>Guess Phase • <br/> {CapTeam(currentTeam)} Turn</>
      : phase === "Clue Phase"
      ? `${CapTeam(currentTeam)} Clue Phase`
      : phase;


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

          {/* <DevRoleTester /> */}

          <div className="flex flex-col items-center">
            <div className="bg-white bg-opacity-10 rounded-xl p-4 shadow-lg">
    <WordBoard
  words={words}
  onWordClick={handleWordClick}
  onVote={handleVote}
  currentUserId={currentUser.id}
  disabled={!canClickBoard}
  revealAll={currentUser.role === "WordMaster"||reveal}
  isGuesser={currentUser.role === "Guesser"}
  currentUserRole={currentUser.role}   
/>


            </div>

            <div className="flex items-center gap-3 pt-9">
              {currentUser.role === "WordMaster" && (
                <ClueInput team= {currentUser.team} onSend={onSendClue} disabled={!canGiveClue} />
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
                    <div className="mt-4 flex items-center gap-6">
            <div className="text-center">
              <div className="text-sm text-white/70 mb-1">Blue Score</div>
              <HexagonBox>{blueScore}</HexagonBox>
            </div>
           
          </div>
          <ChatBox senders={currentUser.name}  team="blue" title="Blue Team Chat" disabled={currentUser.team !== "blue" || currentUser.role === "WordMaster"} />
        </div>

        <div className="fixed bottom-4 right-4">
          <div className="mt-4 flex justify-end items-center">
  <div className="text-center">
    <div className="text-sm text-white/70 mb-1">Orange Score</div>
    <HexagonBox>{orangeScore}</HexagonBox>
  </div>
</div>

          <ChatBox senders={currentUser.name} team="orange" title="Orange Team Chat" disabled={ currentUser.team !== "orange" || currentUser.role === "WordMaster"} />
        </div>
      </div>
    </div>
  );
}