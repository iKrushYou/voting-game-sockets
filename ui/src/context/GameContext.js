import React, { useContext } from "react";
import useLocalStorage from "../functions/useLocalStorage";
import { uuid } from "uuidv4";

const GameContext = React.createContext(null);

const LOCAL_STORAGE = {
  USER_ID: "VOTE_GAME:USER_ID",
  USER_NAME: "VOTE_GAME:USER_NAME",
  GAME_KEY: "VOTE_GAME:GAME_KEY",
};

const GameProvider = ({ children }) => {
  const [userId, setUserId] = useLocalStorage(LOCAL_STORAGE.USER_ID, uuid());
  const [userName, saveUserName] = useLocalStorage(LOCAL_STORAGE.USER_NAME, null);
  const [gameKey, saveGameKey] = useLocalStorage(LOCAL_STORAGE.GAME_KEY, null);

  return (
    <GameContext.Provider value={{ gameKey, saveGameKey, userId, userName, saveUserName }}>
      {children}
    </GameContext.Provider>
  );
};

export { GameProvider, GameContext };

export const useGameContext = () => useContext(GameContext);
