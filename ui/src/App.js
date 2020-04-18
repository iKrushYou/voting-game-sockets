import React from "react";
import { BrowserRouter as Router, Route } from "react-router-dom";
import HomeScreen from "./screens/HomeScreen";
import GameScreen from "./screens/GameScreen";
import { GameProvider } from "./context/GameContext";
import GameMainMenu from "./screens/GameMainMenu";
import GameAdminPage from "./screens/GameAdminPage";
function App() {
  return (
    <div className="App">
      <GameProvider>
        <Router>
          <Route path={"/"} exact component={HomeScreen} />
          <Route path={"/game"} exact component={GameScreen} />
          <Route path={"/game/admin"} exact component={GameAdminPage} />
        </Router>
      </GameProvider>
    </div>
  );
}

export default App;
