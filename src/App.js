// App.js
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import StartMatch from "./pages/StartMatch";
import GameScreen from "./pages/GameScreen";
import { GameProvider } from "./context/GameState";
import Profiles from "./pages/gamelogic/Profiles.js";
import Lobby from "../src/pages/PlayersLobby.js";
function App() {
  return (
    <GameProvider>
      <Profiles>
        <Router>
          <Routes>
            <Route index element={<StartMatch />} />
            <Route path="/lobby/:id" element={<Lobby />} />
            <Route path="/game/:code" element={<GameScreen />} />
          </Routes>
        </Router>
      </Profiles>
    </GameProvider>
  );
}

export default App;
