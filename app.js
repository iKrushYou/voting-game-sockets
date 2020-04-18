const express = require("express");
const socketio = require("socket.io");
const http = require("http");
const moment = require("moment");
const path = require("path");

const { game, joinGame, leaveGame, castVote, changeQuestion, finishQuestion, resetGame } = require("./game");

const PORT = process.env.PORT || 8080;

let app = express();
const server = http.createServer(app);
const io = socketio(server, { path: "/api/socket.io" });

app.use((request, result, next) => {
  result.setHeader("Access-Control-Allow-Origin", "*");
  next();
});

// serve UI
app.use(express.static(path.join(__dirname, "ui/build")));
app.get("*", (req, res, next) => {
  res.sendFile(path.join(__dirname + "/ui/build/index.html"));
});

const SocketFunctions = {
  CONNECTION: "connection",
  DISCONNECT: "disconnect",
  JOIN_GAME: "JOIN_GAME",
  CAST_VOTE: "CAST_VOTE",
  CHANGE_QUESTION: "CHANGE_QUESTION",
  FINISH_QUESTION: "FINISH_QUESTION",
  LEAVE_GAME: "LEAVE_GAME",
  GAME_UPDATE: "GAME_UPDATE",
  UPDATE_SCORE: "UPDATE_SCORE",
  RESET_GAME: "RESET_GAME",
  END_GAME: "END_GAME",
};

const gameKey = "GAME";

const updateGame = (socket, game) => {
  socket.emit(SocketFunctions.GAME_UPDATE, game);
  socket.broadcast.to(gameKey).emit(SocketFunctions.GAME_UPDATE, game);
};

io.on(SocketFunctions.CONNECTION, (socket) => {
  console.log(moment().format() + ": connected - " + socket.id);

  socket.on(SocketFunctions.JOIN_GAME, (props, callback) => {
    console.log(`${moment().format()}: ${SocketFunctions.JOIN_GAME} ${JSON.stringify(props)}`);
    const { userId, userName } = props;
    if (!userId || !userName) {
      callback({ error: "missing props" });
      return;
    }

    const { error, game } = joinGame({
      userId,
      userName,
      socketId: socket.id,
    });

    if (error) return callback({ error });

    socket.emit(SocketFunctions.GAME_UPDATE, game);
    socket.join(gameKey);
    socket.broadcast.to(gameKey).emit(SocketFunctions.GAME_UPDATE, game);

    callback({});
  });

  socket.on(SocketFunctions.CAST_VOTE, (props, callback) => {
    console.log(`${moment().format()}: ${SocketFunctions.CAST_VOTE} ${JSON.stringify(props)}`);
    const { questionId, choice } = props;
    if (questionId === undefined || questionId === null || !choice) {
      callback({ error: "missing props" });
      return;
    }

    const { error } = castVote({
      socketId: socket.id,
      questionId,
      choice,
    });

    updateGame(socket, game);

    callback({});
  });

  socket.on(SocketFunctions.CHANGE_QUESTION, (props, callback) => {
    console.log(`${moment().format()}: ${SocketFunctions.CHANGE_QUESTION} ${JSON.stringify(props)}`);
    const { direction } = props;
    if (!["NEXT", "PREV"].includes(direction)) {
      callback({ error: "invalid direction" });
      return;
    }

    const { error } = changeQuestion({
      socketId: socket.id,
      direction,
    });

    updateGame(socket, game);

    callback({});
  });

  socket.on(SocketFunctions.FINISH_QUESTION, (props, callback) => {
    console.log(`${moment().format()}: ${SocketFunctions.FINISH_QUESTION} ${JSON.stringify(props)}`);

    const { error } = finishQuestion({
      socketId: socket.id,
    });

    updateGame(socket, game);

    callback({});
  });

  socket.on(SocketFunctions.RESET_GAME, (props, callback) => {
    console.log(`${moment().format()}: ${SocketFunctions.RESET_GAME} ${JSON.stringify(props)}`);

    const { error } = resetGame({
      socketId: socket.id,
    });

    socket.emit(SocketFunctions.END_GAME, game);
    socket.broadcast.to(gameKey).emit(SocketFunctions.END_GAME, game);

    callback({});
  });

  socket.on("disconnect", () => {
    console.log(moment().format() + ": disconnected - " + socket.id);
    leaveGame({ socketId: socket.id });
    updateGame(socket, game);
  });
});

server.listen(PORT, () => console.log(`${moment().format()}: Server has been started on port ${PORT}`));
