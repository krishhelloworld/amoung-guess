# todo tasks-:

## 2)fix chatbot -;
- Only thier respective team members can chat in thier respective chatbox
- identity theft is only allowed to access the orange chat only while it is using its power


## 3) after changing profile -;
- chat name refersh 

## 4) Adding dislike and like button on clue given by wordmaster 
---

##  Game Logic & State Management 
- o Implement game rules and logic on frontend (basic): 
- o Manage turn phases (clue, guess, reveal) 
- o Track which words are revealed or guessed 
- o Role assignments (guesser, saboteur, etc) 
- o Validate guesses and update board UI

---

## ROLES-; [ this to feel the one person game to everyone ,such that they can have thier opinions ]

1)jester
2)swapper     //every team have this 
3)role guesser  //1 per game //either guess the jester in own team or guess roles of other teams
4)identity stealer -> highlight a word ,can chat in opponent chats  //1 per game 
)blaze caller -> ignite a word of previous match which are not voted correctly(doesnt work if minority words are more two) than such that first person vote on it is instantly kicked out [if a person swap on it also then also then it will not affect anything]//but it can affect if the opponenet wordmaster has to give words which is his words and blaze caller ignite it already
5)double voter // every team has majority towards it
---


# events-:
```
1)time 2x decrease 
2)special card
3)power stop of characters or those use thier power will be visible to other
4)decrease of grey card and increase of black card
5)dont talk or chat for 30 sec(since the creator of game can kick the people who kinds of talk or chats )
6)voting scramble-: 1 vote dene pr +2 hoga , 2vote dena pr -3,3 vote pr +1, 4 vote dene pr 0 ;
7)remind the words //no light to see the words u have to remind the words by your mind
```
---
### o Implement **game rules** and logic on frontend (basic):





## Constraints & Targets
| Step			| Description
|-----------|-------------
| 1. Lobby & room system(**SERVER.JS**) |	Players can create/join rooms; simple UI for room codes
| 2. Word board UI(**DONE✅**)	 |	Display a 5x5 grid of words that are clickable
|2.1  Player board UI | Display the players 
|  |
| ______________ `*VOTING UI*`   ____________
|`2.5 After fourth round -> Player board UI`            |  `Sort and update the player board according to thier correct votes (also gives the fastest correct voter mvp )`
|`2.7 Player UI->voting buttton AND SKIP BUTTON `           |  `player can vote out the man from the team`
|  |  
|  |  
|  |  
| 3. Role assignment |	Randomly assign players to teams and roles, show private info
| 4. Clue submission(**DONE✅**) |	Clue-giver inputs clue; clue shown only to guessers
| 5. Guess phase(**DONE✅**)     |	Guessers click words on the board; guesses sent to server
| 6. Reveal&sabotage(**DONE✅**) |	Server reveals if guesses are correct or bombs; apply sabotage
| 7. Chat & voting(**Need good ui of voting**)	 |  Players discuss and vote to eliminate suspicious players
| 8. Win condition(**DONE✅**)	 |  Check if any team wins or loses; show results
|9. Words connections  | jester words should match a lot of blue and orange words only ,to make it obvious for it to vote theier
|10. Repeat turns	Start next round until game ends


---

## High-Level Pipeline
```
{
  phase: "CLUE" | "VOTING" | "REVEAL" | "RESOLVE" | "END",
  currentTeam: "Blue" | "Orange",
  clue: { word: "", count: 0 },
  votes: { [playerId]: [wordIndexes...] },
  words: [ { word, type, revealed } ],
  scores: { Blue: 0, Orange: 0 },
  roles: { playerId: "WordMaster" | "Guesser" | "Jester" | "EvilGuesser" },
  winner: null
}
```
---





## Data Layout

### Light Data
```cpp
struct Light {
    float3 position;
    float  radius;
    float3 color;
    float  intensity;
};
```


---



