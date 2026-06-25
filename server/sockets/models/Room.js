const rooms = {};
export default function Room(roomCode, socketId, isAdmin, playerName) {
  if (isAdmin) {
    rooms[roomCode] = {
      players: [
        {
          id: socketId,
          admin: isAdmin,
          playername: playerName,
        },
      ]
    };
    return rooms[roomCode];
  } else {
    if (!rooms[roomCode]) {
      console.log("check",roomCode, rooms[roomCode]);
    } else {
        console.log("we are here")
      rooms[roomCode].players.push({
        id: socketId,
        admin: isAdmin,
        playername: playerName,
      });
      console.log(rooms[roomCode])
      return rooms[roomCode];
    }
  }
}
// export function GiveRooms({roomoCode}){
//     return rooms[roomCode]
// }