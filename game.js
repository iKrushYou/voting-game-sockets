const { uuid } = require("uuidv4");

const game = {
  users: [],
  questions: [
    {
      question: "What is 2+2",
      choices: ["4", "Four", "5", "Greyson's Balls"],
      answer: "Four",
      responses: {},
    },
    {
      question: "What is Greyson's Balls' Name",
      choices: ["Greyson's Balls", "The Rock", "Patrick Mahomes", "Debbie"],
      answer: "Four",
      responses: {},
    },
  ],
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

module.exports = { game, joinGame, leaveGame, castVote, changeQuestion };
