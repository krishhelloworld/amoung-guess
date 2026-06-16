# TODO.md – Backend Migration Plan

## Phase 1 – Setup Backend

* [ ] Create `/server`
* [ ] npm init -y
* [ ] Install# TODO.md – Backend Migration Plan

## Phase 1 – Setup Backend

* [ ] Create `/server`
* [ ] npm init -y
* [ ] Install:

  * express
  * socket.io
  * cors
  * nodemon

Files:
```
server/
├── server.js
├── package.json
└── package-lock.json
```
Goal:
Express + Socket.IO server running.

## Phase 2 – Connect React

Frontend:

* [ ] Install socket.io-client
* [ ] Create `src/services/socket.js`
* [ ] Connect to localhost:5000

Goal:
Browser successfully connects to server.

## Phase 3 – Room System

Move to Server:

* [ ] Create room
* [ ] Generate room code
* [ ] Join room
* [ ] Store players
* [ ] Broadcast player list

Files:
```
server/
├── server.js
├── rooms/
│   └── RoomManager.js
```
Goal:
Multiple players can enter same room.

## Phase 4 – Matchmaking

Move to Server:

* [ ] Queue players
* [ ] Auto-create room
* [ ] Auto-assign players

Goal:
Option A + Option C supported.

## Phase 5 – Move Profiles

Remove from React:

* [ ] profiles
* [ ] currentUser

Move to Server.

React only receives:

socket.on("state-updated")

Goal:
Server owns player data.

## Phase 6 – Move Board Generation

Move:

* [ ] assignTeamsToWords()
* [ ] shuffle()
* [ ] noun generation

Goal:
Server creates board.

## Phase 7 – Move Roles

Move:

* [ ] WordMaster assignment
* [ ] Guesser assignment
* [ ] Jester assignment
* [ ] Trap word generation

Goal:
Roles cannot be cheated.

## Phase 8 – Move Turn Logic

Move:

* [ ] phase
* [ ] currentTeam
* [ ] clue
* [ ] guessRemaining

Goal:
Server controls game flow.

## Phase 9 – Move Voting

Move:

* [ ] handleVote()
* [ ] majority threshold
* [ ] vote caps

Goal:
Votes become authoritative.

## Phase 10 – Move Resolution Engine

Move:

* [ ] resolveTileOutcome()
* [ ] score updates
* [ ] neutral logic
* [ ] assassin logic
* [ ] Jester logic
* [ ] trap logic

Goal:
Server becomes the game engine.

## Phase 11 – Timers

Move:

* [ ] blueTime
* [ ] orangeTime

Goal:
Shared timer.

## Phase 12 – Disconnect Handling

Move:

* [ ] player disconnect
* [ ] reconnect
* [ ] host leave
* [ ] room cleanup

Goal:
Stable multiplayer.

## Phase 13 – Cleanup

React should only:

* Display state# TODO.md – Backend Migration Plan

## Phase 1 – Setup Backend

* [ ] Create `/server`
* [ ] npm init -y
* [ ] Install:

  * express
  * socket.io
  * cors
  * nodemon

Files:
```
server/
├── server.js
├── package.json
└── package-lock.json
```
Goal:
Express + Socket.IO server running.

## Phase 2 – Connect React

Frontend:

* [ ] Install socket.io-client
* [ ] Create `src/services/socket.js`
* [ ] Connect to localhost:5000

Goal:
Browser successfully connects to server.

## Phase 3 – Room System

Move to Server:

* [ ] Create room
* [ ] Generate room code
* [ ] Join room
* [ ] Store players
* [ ] Broadcast player list

Files:
```
server/
├── server.js
├── rooms/
│   └── RoomManager.js
```
Goal:
Multiple players can enter same room.

## Phase 4 – Matchmaking

Move to Server:

* [ ] Queue players
* [ ] Auto-create room
* [ ] Auto-assign players

Goal:
Option A + Option C supported.

## Phase 5 – Move Profiles

Remove from React:

* [ ] profiles
* [ ] currentUser

Move to Server.

React only receives:

socket.on("state-updated")

Goal:
Server owns player data.

## Phase 6 – Move Board Generation

Move:

* [ ] assignTeamsToWords()
* [ ] shuffle()
* [ ] noun generation

Goal:
Server creates board.

## Phase 7 – Move Roles

Move:

* [ ] WordMaster assignment
* [ ] Guesser assignment
* [ ] Jester assignment
* [ ] Trap word generation

Goal:
Roles cannot be cheated.

## Phase 8 – Move Turn Logic

Move:

* [ ] phase
* [ ] currentTeam
* [ ] clue
* [ ] guessRemaining

Goal:
Server controls game flow.

## Phase 9 – Move Voting

Move:

* [ ] handleVote()
* [ ] majority threshold
* [ ] vote caps

Goal:
Votes become authoritative.

## Phase 10 – Move Resolution Engine

Move:

* [ ] resolveTileOutcome()
* [ ] score updates
* [ ] neutral logic
* [ ] assassin logic
* [ ] Jester logic
* [ ] trap logic

Goal:
Server becomes the game engine.

## Phase 11 – Timers

Move:

* [ ] blueTime
* [ ] orangeTime

Goal:
Shared timer.

## Phase 12 – Disconnect Handling

Move:

* [ ] player disconnect
* [ ] reconnect
* [ ] host leave
* [ ] room cleanup

Goal:
Stable multiplayer.

## Phase 13 – Cleanup

React should only:

* Display state
* Emit actions

Server should:

* Validate
* Update
* Broadcast

Final Goal:

React = Screen
Socket.IO = Messenger
Server = Brain

* Emit actions

Server should:

* Validate
* Update
* Broadcast

Final Goal:

React = Screen
Socket.IO = Messenger
Server = Brain
:

  * express
  * socket.io
  * cors
  * nodemon

Files:

server/
├── server.js
├── package.json
└── package-lock.json

Goal:
Express + Socket.IO server running.

## Phase 2 – Connect React

Frontend:

* [ ] Install socket.io-client
* [ ] Create `src/services/socket.js`
* [ ] Connect to localhost:5000

Goal:
Browser successfully connects to server.

## Phase 3 – Room System

Move to Server:

* [ ] Create room
* [ ] Generate room code
* [ ] Join room
* [ ] Store players
* [ ] Broadcast player list

Files:
```
server/
├── server.js
├── rooms/
│   └── RoomManager.js
```
Goal:
Multiple players can enter same room.

## Phase 4 – Matchmaking

Move to Server:

* [ ] Queue players
* [ ] Auto-create room
* [ ] Auto-assign players

Goal:
Option A + Option C supported.

## Phase 5 – Move Profiles

Remove from React:

* [ ] profiles
* [ ] currentUser

Move to Server.

React only receives:

socket.on("state-updated")

Goal:
Server owns player data.

## Phase 6 – Move Board Generation

Move:

* [ ] assignTeamsToWords()
* [ ] shuffle()
* [ ] noun generation

Goal:
Server creates board.

## Phase 7 – Move Roles

Move:

* [ ] WordMaster assignment
* [ ] Guesser assignment
* [ ] Jester assignment
* [ ] Trap word generation

Goal:
Roles cannot be cheated.

## Phase 8 – Move Turn Logic

Move:

* [ ] phase
* [ ] currentTeam
* [ ] clue
* [ ] guessRemaining

Goal:
Server controls game flow.

## Phase 9 – Move Voting

Move:

* [ ] handleVote()
* [ ] majority threshold
* [ ] vote caps

Goal:
Votes become authoritative.

## Phase 10 – Move Resolution Engine

Move:

* [ ] resolveTileOutcome()
* [ ] score updates
* [ ] neutral logic
* [ ] assassin logic
* [ ] Jester logic
* [ ] trap logic

Goal:
Server becomes the game engine.

## Phase 11 – Timers

Move:

* [ ] blueTime
* [ ] orangeTime

Goal:
Shared timer.

## Phase 12 – Disconnect Handling

Move:

* [ ] player disconnect
* [ ] reconnect
* [ ] host leave
* [ ] room cleanup

Goal:
Stable multiplayer.

## Phase 13 – Cleanup

React should only:

* Display state
* Emit actions

Server should:

* Validate
* Update
* Broadcast

Final Goal:

React = Screen
Socket.IO = Messenger
Server = Brain
