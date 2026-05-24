import { Divide, Heading1 } from 'lucide-react';
import {useState,useEffect} from 'react';
import {useContext, createContext} from 'react';
import {useRef} from 'react';
const Context= createContext();
const profiles = ['Rahul','Gamer','guptaRahul'];
const size = profiles.length;
  const opacityLevels = [
    "bg-purple-900/100",
    "bg-purple-900/70",
    "bg-purple-900/50",
  ];

function CurrentProfile(){
return profiles[0];
}
function UserProvider({children}){
const [profile,setprofile]=useState(CurrentProfile());
return (
<Context.Provider value = {{profile, setprofile}}>
{children}
    </Context.Provider>
)
}
function Profile(){
const {profile} = useContext(Context) ;
return (
    <h1>Current User : <span className='bg-purple-900/30 text-purple-900'>{profile}</span></h1>);
}

function SetProfile(){
const [count,setcount] =useState(0);
const {setprofile}  = useContext(Context);

useEffect(() => {setprofile(profiles[count]);},[count]);//“Watch this variable. If it changes, run the effect.”
    return (<>
        <button onClick={()=>setcount((count+1)%size)}> <span className={`${opacityLevels[count]} text-purple-200 px-2`}>
        Change Account
      </span></button>

        </>
);

}
function ChatBox(){
return (
    <UserProvider >
    <Profile/>
    <SetProfile/>
    </UserProvider>
)
}
export default ChatBox;
// Account switch
// Userprovider
// Profile
// SetProfile
// app