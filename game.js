const { uuid } = require("uuidv4");
const data = require("./questions");
const images = require("./images.json");

const blankGame = {
  users: [],
  questions: data.questions,
  currentQuestion: 0,
};

const game = {...blankGame}

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
  if (question.responses[user.id] === choice) {
    // remove vote
    delete question.responses[user.id];
  } else {
    // cast vote
    question.responses[user.id] = choice;
  }

  return { game };
};

const changeQuestion = ({ socketId, direction }) => {
  const user = findUserBySocketId(socketId);
  // if (!user.owner) return { error: "Not owner" };
  if (direction === "NEXT") {
    game.currentQuestion = Math.min(game.currentQuestion + 1, game.questions.length - 1);
  } else {
    game.currentQuestion = Math.max(game.currentQuestion - 1, 0);
  }

  return { game };
};

const finishQuestion = ({ socketId }) => {
  const user = findUserBySocketId(socketId);
  // if (!user.owner) return { error: "Not owner" };
  const question = game.questions[game.currentQuestion];
  question.done = !question.done;

  ["chrissy", "denise"].forEach((personImage) => {
    if (!question[`${personImage}Image`]) {
      question[`${personImage}Image`] = images[personImage][Math.floor(Math.random() * images[personImage].length)];
    }
  });

  return { game };
};

const resetGame = ({socketId}) => {
  const user = findUserBySocketId(socketId);
  // if (!user.owner) return { error: "Not owner" };
  game.users = []
  game.questions = [...data.questions]
  game.currentQuestion = 0

  return {}
}

module.exports = { game, joinGame, leaveGame, castVote, changeQuestion, finishQuestion, resetGame };
