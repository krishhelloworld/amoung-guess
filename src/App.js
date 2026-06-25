// App.js
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import StartMatch from "./pages/StartMatch";
import GameScreen from "./pages/GameScreen";
import { GameProvider } from "./context/GameState";
import Lobby from '../src/pages/PlayersLobby.js'
function App() {
  return (
    <GameProvider>
      <Router>
        <Routes>
          <Route path="/" element={<StartMatch />} />
          <Route path="/lobby/:id" element = {<Lobby />}/>
          <Route path="/game/:code" element={<GameScreen />} />
        </Routes>
      </Router>
    </GameProvider>
  );
}

export default App;

