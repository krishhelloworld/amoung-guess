import React, {useState, useContext,createContext} from "react";
const profileContext = createContext();
export default function Profiles({children}){
const [profiles, setProfiles] = useState([
    { id: 1, name: "Carry", team: "blue", role: "Guesser" ,canClick : true, maxVotes: 0},
    { id: 2, name: "Alex", team: "orange", role: "Guesser",canClick : true, maxVotes: 0 },
    { id: 3, name: "Sam", team: "blue", role: "WordMaster",canClick :false , maxVotes: 0 },
    { id: 4, name: "Lara", team: "orange", role: "WordMaster",canClick :false, maxVotes: 0 },
    { id: 5, name: "Jordan", team: "blue", role: "Jester",canClick : true, maxVotes: 0 }
]);
return(
<profileContext.Provider value = {{profiles, setProfiles}} >
   {children}
</profileContext.Provider>
)
}
export function useProfiles(){
    return useContext(profileContext)
}