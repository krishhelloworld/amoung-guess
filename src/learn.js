 import {useState,useEffect} from 'react';


function Square ({value ,click,clicked,index}){
  const [str,setStr]=useState("");
  console.log(value)
useEffect(() => {
  if (clicked[index]) {
    setStr(value);
    
  }
}, [clicked,index]);
  console.log(clicked)
  return(
   <button className = "button"
   disabled= {!clicked[index]} 
    onClick = {click} style= {{ width: "70px",
  height: "70px",
  backgroundColor: "#000000",
  color : !clicked[index] ?  "#08c634" : '#000000',
  fontWeight:"1000",
  fontSize:"20px"}}>
   {str}  
   </button>
  )
}
//first there wil be only one value on a particular button and then
//this button will not respond on clicking 
export default function App(){
const [Turn, setTurn]= useState("X");
const [clicked,setClicked]=useState([true,true,true]);
function setIndex(index){
  
  setClicked(prev=>{
    const newarr=[...prev];
  newarr[index]=false;
    
   console.log(newarr)
    return newarr;}
      );
}
const handleclick= (index)=>{
  setTurn((prev)=>prev === "X" ? "O" :"X" );
  setIndex(index);
}
const Winner = ()=> {
const winarr= [[1,2,3],[4,5,6],[7,8,9],[1,5,9],[3,5,7],[1,4,7],[2,5,8],[3,6,9]];
const arr = clicked.flatMap(
}
  return (
    <>
      <body style={{display: "flex",
  justifyContent: "center",
  alignItems: "center",height: "100vh",background:"darkgreen"}}>
    <div>
  <Square value={Turn} click={()=>handleclick(0)}  clicked= {clicked} index={0} />
      <Square value={Turn}click={()=> handleclick(1)} clicked= {clicked} index={1}/>
       <Square value={Turn} click={()=> handleclick(2)} clicked= {clicked} index={2}/>
      
    </div>
   <div>
  <Square value={Turn} click={()=>handleclick(0)}  clicked= {clicked} index={0} />
      <Square value={Turn}click={()=> handleclick(1)} clicked= {clicked} index={1}/>
       <Square value={Turn} click={()=> handleclick(2)} clicked= {clicked} index={2}/>
      
    </div>   <div>
  <Square value={Turn} click={()=>handleclick(0)}  clicked= {clicked} index={0} />
      <Square value={Turn}click={()=> handleclick(1)} clicked= {clicked} index={1}/>
       <Square value={Turn} click={()=> handleclick(2)} clicked= {clicked} index={2}/>
      
    </div>
        
      </body>
      </>
  )
}
//activating the bacground and disappear it and learned about disabled work only on {true}, or {false} [not zero or one ,etc]
// when the state value is in function the state prev value is changing because multiple component was using the thier own local function i 
// have to put that all in the parent so that they all use the same global 
//when i have to pass the 2 events to react on onclick event of btton i havto merge the two event and then call it 
//  const [str,setStr]=useState(""
// useEffect(() => {
//   if (clicked[index]) {
//     setStr(value);
// found this logic and which is correct but cause infinte render and then useEffect save me (kyuki component render hone 
// ke baad code suru se run hote uss useState ki value ke sath toh if clicked[index] toh hr render pr true hi rhega jiss 
// wajah se voh loop mein fass yaha useState btaya ki agar value,index change nhi hua toh loop mein mt fsna
