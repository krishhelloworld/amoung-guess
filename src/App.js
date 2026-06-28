// App.js
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import StartMatch from "./pages/StartMatch";
import GameScreen from "./pages/GameScreen";
import { GameProvider } from "./context/GameState";
import Profiles from './context/ProfileContext.js'
import Lobby from "../src/pages/PlayersLobby.js";
function App() {
  return (
    <GameProvider>
     
        <Router>
          <Routes>
            <Route
             index element={ <StartMatch /> } />

            <Route 
            path="/lobby/:id" 
            element={ <Lobby />} />

            <Route
             path="/game/:code"
             element={ 
              <Profiles>
              <GameScreen />
            </Profiles>
              } />
          </Routes>
        </Router>
      
    </GameProvider>
  );
}

export default App;
