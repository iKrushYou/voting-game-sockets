const { uuid } = require("uuidv4");
const data = require("./questions");

const game = {
  users: [],
  questions: data.questions,
  currentQuestion: 0,
};

const findUserBySocketId = (socketId) => {
  return game.users.find((xUser) => xUser.sockets.includes(socketId));
};

const joinGame = ({ userId, userName, socketId }) => {
  const owner = game.users.length === 0;
  let user = game.users.find((xUser) => xUser.id === userId);
  if (!user) {
    user = {
      id: userId,
      name: userName,
      sockets: [socketId],
      owner,
    };
    game.users.push(user);
  } else {
    user.sockets = [...new Set([...user.sockets, socketId])];
  }

  return { game };
};

const leaveGame = ({ socketId }) => {
  game.users.forEach((xUser) => {
    if ((xUser.sockets || []).includes(socketId)) {
      xUser.sockets = xUser.sockets.filter((xSocket) => xSocket !== socketId);
    }
  });
  console.log(JSON.stringify(game));

  return { game };
};

const castVote = ({ socketId, questionId, choice }) => {
  const user = findUserBySocketId(socketId);
  const question = game.questions[questionId];
  question.responses[user.id] = choice;

  return { game };
};

const changeQuestion = ({ socketId, direction }) => {
  const user = findUserBySocketId(socketId);
  if (!user.owner) return { error: "Not owner" };
  if (direction === "NEXT") {
    game.currentQuestion = Math.min(game.currentQuestion + 1, game.questions.length - 1);
  } else {
    game.currentQuestion = Math.max(game.currentQuestion - 1, 0);
  }

  return { game };
};

const finishQuestion = ({ socketId }) => {
  const user = findUserBySocketId(socketId);
  if (!user.owner) return { error: "Not owner" };
  const question = game.questions[game.currentQuestion];
  question.done = !question.done;
  return { game };
};

module.exports = { game, joinGame, leaveGame, castVote, changeQuestion, finishQuestion };
