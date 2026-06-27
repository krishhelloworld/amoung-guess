import nlp from  "compromise";
import {generate} from "random-words";
import React from "react";


function shuffle(arr){
  for(let i= arr.length - 1; i>0 ; i--){
    const j = Math.floor(Math.random() * (i+1));
    [arr[j],arr[i]]= [arr[i],arr[j]];
  }
  return arr;
}
//=== Noun Extraction from the nlp
function isNoun(word) {
    return nlp(word).nouns().out("array").length > 0;
}

export default function AssignTeamToWords(){
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
} 