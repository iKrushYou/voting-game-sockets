import React, { useEffect, useMemo, useRef, useState } from "react";
import io from "socket.io-client";
import { useGameContext } from "../context/GameContext";
import { SOCKET_ENDPOINT_DEV, SOCKET_FUNCTIONS } from "../config";
import Container from "@material-ui/core/Container";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import CircularProgress from "@material-ui/core/CircularProgress";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import ButtonBase from "@material-ui/core/ButtonBase";
import Button from "@material-ui/core/Button";
import UserChip from "../components/UserChip";
import { CardMedia, CardHeader, Chip } from "@material-ui/core";
import Collapse from "@material-ui/core/Collapse";
import { handleCastVote, handleChangeQuestion, handleFinishQuestion } from "../functions/GameService";
let socket;

export default function ({ history }) {
  const { userId, userName } = useGameContext();

  const [game, setGame] = useState();

  const handleLeaveGame = () => {
    history.push("/");
  };

  useEffect(() => {
    if (!userName) handleLeaveGame();

    socket = io(SOCKET_ENDPOINT_DEV, { path: "/api/socket.io" });

    socket.on("connect", () => {
      socket.emit(SOCKET_FUNCTIONS.JOIN_GAME, { userId, userName }, ({ error }) => {
        if (error) {
          alert(error);
          handleLeaveGame();
        }
      });
    });

    socket.on(SOCKET_FUNCTIONS.GAME_UPDATE, (gameUpdate) => {
      setGame(gameUpdate);
    });

    socket.on(SOCKET_FUNCTIONS.END_GAME, () => {
      handleLeaveGame();
    });

    return () => {
      socket.emit(SOCKET_FUNCTIONS.DISCONNECT);
      socket.off();
    };
  }, []);

  const isOnline = (user) => !!user.sockets.length;

  const users = game?.users.sort((a, b) => b.id.localeCompare(a.id)).sort((a, b) => isOnline(b) - isOnline(a)) || [];
  const getUser = (userId) => users.find((_user) => _user.id === userId);
  const currentUser = getUser(userId);
  const currentQuestion = game?.questions[game.currentQuestion];

  return (
    <Container maxWidth={"md"} disableGutters style={{ marginBottom: 64 }}>
      <Card>
        <CardContent style={{ backgroundColor: "#ecf0f1" }}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant={"h3"}>Welcome {userName}</Typography>
            </Grid>
            {game ? (
              <>
                {/*<Grid item xs={12}>*/}
                {/*  <Grid container spacing={1} style={{ alignItems: "center" }}>*/}
                {/*    <Grid item>*/}
                {/*      <Typography>Users in game: </Typography>*/}
                {/*    </Grid>*/}
                {/*    {users.map((user) => (*/}
                {/*      <Grid item key={user.id}>*/}
                {/*        <UserChip*/}
                {/*          user={user}*/}
                {/*          color={user.sockets.length ? (user.owner ? "secondary" : "primary") : "default"}*/}
                {/*        />*/}
                {/*      </Grid>*/}
                {/*    ))}*/}
                {/*  </Grid>*/}
                {/*</Grid>*/}
                <Grid item xs={12}>
                  <Collapse in={currentQuestion.done}>
                    <QuestionComplete currentQuestion={currentQuestion} getUser={getUser} />
                  </Collapse>
                </Grid>
                <Grid item xs={12}>
                  <Collapse in={!currentQuestion.done}>
                    <QuestionAnswer
                      currentQuestion={currentQuestion}
                      handleCastVote={handleCastVote}
                      userId={userId}
                      game={game}
                    />
                  </Collapse>
                </Grid>
                {currentUser?.owner && (
                  <Grid item xs={12}>
                    <div>
                      <Typography
                        variant={"body2"}
                        style={{ display: "flex", flexDirection: "row-reverse", marginBottom: 8 }}
                      >
                        Question {game.currentQuestion + 1} / {game.questions.length}
                      </Typography>
                    </div>
                    <div style={{ display: "flex", margin: -4 }}>
                      {currentQuestion.done ? (
                        <Button
                          variant={"outlined"}
                          color={"primary"}
                          onClick={() => handleFinishQuestion(socket)}
                          style={{ margin: 4 }}
                        >
                          {currentQuestion.done ? "Back" : "Done"}
                        </Button>
                      ) : (
                        <Button
                          variant={"outlined"}
                          color={"primary"}
                          onClick={() => handleChangeQuestion(socket, "PREV")}
                          style={{ margin: 4 }}
                        >
                          Prev
                        </Button>
                      )}
                      <div style={{ flex: 1 }} />
                      {currentQuestion.done ? (
                        <Button
                          variant={"outlined"}
                          color={"primary"}
                          onClick={() => handleChangeQuestion(socket, "NEXT")}
                          style={{ margin: 4 }}
                        >
                          Next
                        </Button>
                      ) : (
                        <Button
                          variant={"outlined"}
                          color={"primary"}
                          onClick={() => handleFinishQuestion(socket)}
                          style={{ margin: 4 }}
                        >
                          {currentQuestion.done ? "Back" : "Done"}
                        </Button>
                      )}
                    </div>
                  </Grid>
                )}
              </>
            ) : (
              <Grid item xs={12}>
                <div style={{ display: "flex", justifyContent: "center" }}>
                  <CircularProgress />
                </div>
              </Grid>
            )}
          </Grid>
        </CardContent>
      </Card>
      {/*<Card style={{ overflow: "scroll", marginTop: 64 }}>*/}
      {/*  <pre>{JSON.stringify(game, null, 2)}</pre>*/}
      {/*</Card>*/}
    </Container>
  );
}

function QuestionAnswer({ currentQuestion, handleCastVote, userId, game }) {
  const usersLeftToVote = game.users.filter((_user) => !currentQuestion.responses.hasOwnProperty(_user.id));
  const usersWhoVoted = game.users.filter((_user) => currentQuestion.responses.hasOwnProperty(_user.id));

  return (
    <Grid container spacing={1}>
      <Grid item xs={12}>
        <Typography variant={"h5"}>{currentQuestion.question}</Typography>
      </Grid>
      {currentQuestion.choices.map((choice) => (
        <Grid item xs={12} md={6}>
          <Card
            style={{
              height: "100%",
              backgroundColor: currentQuestion.responses[userId] === choice ? "rgba(52,152,219,0.5)" : null,
            }}
          >
            <ButtonBase
              style={{ width: "100%", height: "100%" }}
              onClick={() => handleCastVote(socket, game.currentQuestion, choice)}
            >
              <CardContent style={{ width: "100%" }}>
                <Typography>{choice}</Typography>
              </CardContent>
            </ButtonBase>
          </Card>
        </Grid>
      ))}
      <Grid item xs={12}>
        <Typography>{usersLeftToVote.length ? "Waiting on votes" : "Everyone has voted"}</Typography>
      </Grid>
      {game.users.map((_user) => (
        <Grid item>
          <UserChip key={_user.id} user={_user} disabled={!currentQuestion.responses.hasOwnProperty(_user.id)} />
        </Grid>
      ))}
    </Grid>
  );
}

const TIMEOUT = 1000;

function QuestionComplete({ currentQuestion, getUser }) {
  const [votes, setVotes] = useState({ chrissy: [], denise: [] });
  const responseCount = Object.keys(currentQuestion.responses).length;
  const [step, setStep] = useState(-1);
  const doneVoting = useMemo(() => step === responseCount, [step]);

  const counterRef = useRef();

  const increaseCounter = () => {
    setStep((step) => step + 1);
  };

  useEffect(() => {
    console.log({ step, votes, doneVoting });
    if (step === responseCount) {
      clearInterval(counterRef.current);
      return;
    }
    if (step >= 0 && step < responseCount) {
      const entries = Object.entries(currentQuestion.responses);
      const [userId, answer] = entries[step];
      const user = getUser(userId);

      setVotes((prev) => ({ ...prev, [answer.toLowerCase()]: [...prev[answer.toLowerCase()], user.name] }));
    }
  }, [step]);

  useEffect(() => {
    if (currentQuestion.done) {
      setVotes({ chrissy: [], denise: [] });
      setStep(-1);

      const counter = setInterval(() => {
        increaseCounter();
      }, TIMEOUT);

      counterRef.current = counter;

      return () => clearInterval(counter);
    }
  }, [currentQuestion.done]);

  const percentChrissy = !!votes["chrissy"].length
    ? ((votes["chrissy"].length / (votes["denise"].length + votes["chrissy"].length)) * 50).toFixed(2)
    : 0;
  const percentDenise = !!votes["denise"].length
    ? ((votes["denise"].length / (votes["denise"].length + votes["chrissy"].length)) * 50).toFixed(2)
    : 0;
  // const votePercent = 1 / responseCount;
  // const percentChrissy = votes["chrissy"].length * votePercent * 100;
  // const percentDenise = votes["denise"].length * votePercent * 100;

  const winner =
    votes["chrissy"].length === votes["denise"].length
      ? "Tied"
      : votes["chrissy"].length > votes["denise"].length
      ? "Chrissy"
      : "Denise";
  return (
    <Grid item xs={12}>
      <Grid container spacing={1} direction="row" justify="center" alignItems="center">
        <Grid item xs={12}>
          <Typography variant={"h5"}>{currentQuestion.question}</Typography>
          {!doneVoting && <Typography variant={"h5"}>Voting Tabulating</Typography>}
          {doneVoting && (
            <Typography variant={"h5"}>
              {winner === "Tied" ? "Tied between Denise and Chrissy" : `Winner is ${winner}`}
            </Typography>
          )}
          <Collapse in={doneVoting}>
            <Typography variant={"h6"}>
              {winner === "Tied"
                ? "Everyone Drink!!"
                : winner === "Chrissy"
                ? `Drink : ${
                    votes["denise"].length
                      ? votes["denise"].join(", ")
                      : "Just Dan I guess since everyone voted the same "
                  }`
                : `Drink : ${
                    votes["chrissy"].length
                      ? votes["chrissy"].join(", ")
                      : "Just Dan I guess since everyone voted the same"
                  }`}
            </Typography>
          </Collapse>
        </Grid>
        <Grid item xs={6}>
          <Card
            style={{
              position: "relative",
              overflow: "hidden",
              borderWidth: 5,
              borderStyle: "solid",
              borderColor:
                doneVoting && winner === "Chrissy" ? "green" : doneVoting && winner === "Tied" ? "blue" : "transparent",
            }}
          >
            <CardHeader title={`Votes: ${votes["chrissy"].length}`} />
            <CardMedia component="img" style={{ height: 350 }} image={currentQuestion.chrissyImage} title="Chrissy" />

            <div
              style={{
                position: "absolute",
                bottom: "0",
                left: "0",
                color: "black",
                backgroundColor:
                  percentChrissy > 50 / 2 ? "#2ecc71" : parseInt(percentChrissy) === 50 / 2 ? "#2980b9" : "#e74c3c",
                width: "100%",
                height: `${percentChrissy * 0.85}%`,
                opacity: 0.5,
                transition: "all .3s ease-in",
              }}
            />
            <Grid
              container
              spacing={1}
              style={{
                position: "absolute",
                bottom: "10px",
                left: "10px",
              }}
            >
              {votes["chrissy"].map((name, ind) => (
                <Grid item key={ind}>
                  <Chip color={percentChrissy > 50 / 2 ? "primary" : "secondary"} label={name} />
                </Grid>
              ))}
            </Grid>
          </Card>
        </Grid>
        <Grid item xs={6}>
          <Card
            style={{
              position: "relative",
              overflow: "hidden",
              borderColor:
                doneVoting && winner === "Denise" ? "green" : doneVoting && winner === "Tied" ? "blue" : "transparent",
              borderWidth: 5,
              borderStyle: "solid",
            }}
          >
            <CardHeader title={`Votes: ${votes["denise"].length}`} />
            <div style={{ positon: "relative" }}>
              <CardMedia component="img" style={{ height: 350 }} image={currentQuestion.deniseImage} title={"Denise"} />
              <div
                style={{
                  position: "absolute",
                  bottom: "0",
                  left: "0",
                  color: "black",
                  backgroundColor:
                    percentDenise > 50 / 2 ? "#2ecc71" : parseInt(percentDenise) === 50 / 2 ? "#2980b9" : "#e74c3c",
                  width: "100%",
                  height: `${0.85 * percentDenise}%`,
                  opacity: 0.5,
                  transition: "height .3s ease-in",
                }}
              />
            </div>
            <Grid
              container
              spacing={1}
              style={{
                position: "absolute",
                bottom: "10px",
                left: "10px",
              }}
            >
              {votes["denise"].map((name, ind) => (
                <Grid item key={ind}>
                  <Chip color={percentDenise > 50 / 2 ? "primary" : "secondary"} label={name} />
                </Grid>
              ))}
            </Grid>
          </Card>
        </Grid>
      </Grid>
    </Grid>
  );
}
