// App.js
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import StartMatch from "./StartMatch";
import GameScreen from "./pages/GameScreen";
import { GameProvider } from "./context/GameState";

function App() {
  return (
    <GameProvider>
      <Router>
        <Routes>
          <Route path="/" element={<StartMatch />} />
          <Route path="/game" element={<GameScreen />} />
        </Routes>
      </Router>
    </GameProvider>
  );
}

export default App;

