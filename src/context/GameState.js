import React, { createContext, useContext, useReducer } from "react";

const initialState = {
  phase: "CLUE", // CLUE → VOTING → REVEAL → RESOLVE → END
  currentTeam: "Blue",
  clue: { word: "", count: 0 },
  votes: {}, // { playerId: wordIndex }
  words: [], // to be filled in GameScreen with {word, type, revealed}
  scores: { Blue: 0, Orange: 0 },
  roles: {}, // { playerId: "WordMaster" | "Guesser" | "Jester" | "EvilGuesser" }
  winner: null,
};

function gameReducer(state, action) {
  switch (action.type) {
    case "GIVE_CLUE":
      return {
        ...state,
        clue: { word: action.payload.word, count: action.payload.count },
        phase: "VOTING",
      };

    case "CAST_VOTE":
      return {
        ...state,
        votes: {
          ...state.votes,
          [action.payload.playerId]: action.payload.wordIndexes,
        },
      };

    case "REVEAL_VOTES":
      return {
        ...state,
        phase: "REVEAL",
      };

    case "RESOLVE_WORD":
      const { index } = action.payload;
      const words = [...state.words];
      words[index].revealed = true;

      // scoring logic
      let scores = { ...state.scores };
      if (words[index].type === state.currentTeam) {
        scores[state.currentTeam] += 1;
      } else if (words[index].type === "Black") {
        return { ...state, phase: "END", winner: "Jester" };
      } else if (words[index].type === "White") {
        return { ...state, phase: "END", winner: state.currentTeam };
      }

      return {
        ...state,
        words,
        scores,
        phase: "RESOLVE",
      };

    case "END_TURN":
      return {
        ...state,
        currentTeam: state.currentTeam === "Blue" ? "Orange" : "Blue",
        phase: "CLUE",
        clue: { word: "", count: 0 },
        votes: {},
      };

    default:
      return state;
  }
}


// --------- Reducer ---------
function reducer(state, action) {
  switch (action.type) {
    case "SET_WORDS":
      return { ...state, words: action.payload };

    case "GIVE_CLUE":
      return {
        ...state,
        clue: { word: action.payload.word, count: action.payload.count },
        phase: "VOTING",
      };

    case "CAST_VOTE":
      return {
        ...state,
        votes: { ...state.votes, [action.playerId]: action.wordIndex },
      };

    case "REVEAL_VOTES":
      return { ...state, phase: "REVEAL" };

    case "RESOLVE_WORD":
      const { wordIndex } = action;
      const word = state.words[wordIndex];

      if (word.revealed) return state; // already clicked

      let newWords = [...state.words];
      newWords[wordIndex] = { ...word, revealed: true };

      let newScores = { ...state.scores };
      let winner = null;

      // update scoring logic
      if (word.type === "Blue") newScores.Blue++;
      if (word.type === "Orange") newScores.Orange++;
      if (word.type === "White") winner = state.currentTeam; // instant win
      if (word.type === "Black") winner = "Jester"; // jester win

      return {
        ...state,
        words: newWords,
        scores: newScores,
        winner,
        phase: winner ? "END" : "RESOLVE",
      };

    case "END_TURN":
      return {
        ...state,
        currentTeam: state.currentTeam === "Blue" ? "Orange" : "Blue",
        clue: { word: "", count: 0 },
        votes: {},
        phase: "CLUE",
      };

    case "DECLARE_WINNER":
      return { ...state, winner: action.payload, phase: "END" };

    default:
      return state;
  }
}


// --------- Context Setup ---------
const GameContext = createContext();

export function GameProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  return (
    <GameContext.Provider value={{ state, dispatch }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  return useContext(GameContext);
}
