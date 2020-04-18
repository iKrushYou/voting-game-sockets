import { SOCKET_FUNCTIONS } from "../config";

const handleCastVote = (socket, questionId, choice) => {
  socket.emit(SOCKET_FUNCTIONS.CAST_VOTE, { questionId, choice }, ({ error }) => {
    if (error) {
      alert(error);
    }
  });
};

const handleChangeQuestion = (socket, direction) => {
  socket.emit(SOCKET_FUNCTIONS.CHANGE_QUESTION, { direction }, ({ error }) => {
    if (error) {
      alert(error);
    }
  });
};

const handleFinishQuestion = (socket) => {
  socket.emit(SOCKET_FUNCTIONS.FINISH_QUESTION, {}, ({ error }) => {
    if (error) {
      alert(error);
    }
  });
};

const handleResetGame = (socket) => {
  socket.emit(SOCKET_FUNCTIONS.RESET_GAME, {}, ({ error }) => {
    if (error) {
      alert(error);
    }
  });
};

export { handleCastVote, handleChangeQuestion, handleFinishQuestion, handleResetGame };
