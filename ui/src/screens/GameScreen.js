import React, { useEffect, useState } from "react";
import io from "socket.io-client";
import { useGameContext } from "../context/GameContext";
import { SOCKET_ENDPOINT_DEV, SOCKET_FUNCTIONS } from "../config";
import Container from "@material-ui/core/Container";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import CircularProgress from "@material-ui/core/CircularProgress";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import Chip from "@material-ui/core/Chip";
import ButtonBase from "@material-ui/core/ButtonBase";
import Button from "@material-ui/core/Button";
import * as images from "../Image/images";
import UserChip from "../components/UserChip";
import { CardMedia, CardHeader } from "@material-ui/core";

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
      // fetchGame().then(setGame);
    });

    socket.on(SOCKET_FUNCTIONS.GAME_UPDATE, (gameUpdate) => {
      setGame(gameUpdate);
    });

    return () => {
      socket.emit(SOCKET_FUNCTIONS.DISCONNECT);
      socket.off();
    };
  }, []);

  const handleCastVote = (questionId, choice) => {
    socket.emit(SOCKET_FUNCTIONS.CAST_VOTE, { questionId, choice }, ({ error }) => {
      if (error) {
        alert(error);
      }
    });
  };

  const handleChangeQuestion = (direction) => {
    socket.emit(SOCKET_FUNCTIONS.CHANGE_QUESTION, { direction }, ({ error }) => {
      if (error) {
        alert(error);
      }
    });
  };

  const handleFinishQuestion = () => {
    socket.emit(SOCKET_FUNCTIONS.FINISH_QUESTION, {}, ({ error }) => {
      if (error) {
        alert(error);
      }
    });
  };

  const users = game?.users.sort((a, b) => b.sockets.length - a.sockets.length) || [];
  const getUser = (userId) => users.find((_user) => _user.id === userId);
  const currentUser = getUser(userId);
  const currentQuestion = game?.questions[game.currentQuestion];

  return (
    <Container maxWidth={"md"} disableGutters>
      <Card>
        <CardContent style={{ backgroundColor: "#ecf0f1" }}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant={"h3"}>Game Screen Welcome {userName}</Typography>
            </Grid>
            {game ? (
              <>
                <Grid item xs={12}>
                  <Grid container spacing={1} style={{ alignItems: "center" }}>
                    <Grid item>
                      <Typography>Users in game: </Typography>
                    </Grid>
                    {users.map((user) => (
                      <Grid item key={user.id}>
                        <UserChip
                          user={user}
                          color={user.sockets.length ? (user.owner ? "secondary" : "primary") : "default"}
                        />
                      </Grid>
                    ))}
                  </Grid>
                </Grid>
                {currentQuestion.done ? (
                  <QuestionComplete
                      currentQuestion={currentQuestion}
                      getUser={getUser}
                  />
                ) : (
                  <QuestionAnswer
                    currentQuestion={currentQuestion}
                    handleCastVote={handleCastVote}
                    userId={userId}
                    game={game}
                  />
                )}
                {currentUser?.owner && (
                  <Grid item xs={12} style={{ display: "flex", margin: -4 }}>
                    <Button
                      variant={"outlined"}
                      color={"primary"}
                      onClick={() => handleChangeQuestion("PREV")}
                      style={{ margin: 4 }}
                    >
                      Prev
                    </Button>
                    <div style={{ flex: 1 }} />
                    <Button
                      variant={"outlined"}
                      color={"primary"}
                      onClick={() => handleFinishQuestion()}
                      style={{ margin: 4 }}
                    >
                      {currentQuestion.done ? "Back" : "Done"}
                    </Button>
                    <Button
                      variant={"outlined"}
                      color={"primary"}
                      onClick={() => handleChangeQuestion("NEXT")}
                      style={{ margin: 4 }}
                    >
                      Next
                    </Button>
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
      <Card style={{ overflow: "scroll", marginTop: 64 }}>
        <pre>{JSON.stringify(game, null, 2)}</pre>
      </Card>
    </Container>
  );
}

function QuestionAnswer({ currentQuestion, handleCastVote, userId, game }) {
  const usersLeftToVote = game.users.filter((_user) => !currentQuestion.responses.hasOwnProperty(_user.id));

  return (
    <Grid item xs={12}>
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
                onClick={() => handleCastVote(game.currentQuestion, choice)}
              >
                <CardContent style={{ width: "100%" }}>
                  <Typography>{choice}</Typography>
                  {/*<Grid container spacing={1}>*/}
                  {/*  {Object.entries(currentQuestion.responses)*/}
                  {/*    .filter(([_, responseChoice]) => responseChoice === choice)*/}
                  {/*    .map(([responseUserId, responseChoice]) => {*/}
                  {/*      const responseUser = getUser(responseUserId);*/}
                  {/*      return (*/}
                  {/*        <Grid item>*/}
                  {/*          <Chip label={responseUser.name} />*/}
                  {/*        </Grid>*/}
                  {/*      );*/}
                  {/*    })}*/}
                  {/*</Grid>*/}
                </CardContent>
              </ButtonBase>
            </Card>
          </Grid>
        ))}
        <Grid item xs={12}>
          <Typography>{usersLeftToVote.length ? "Who hasn't voted:" : "Everyone has voted"}</Typography>
        </Grid>
        {usersLeftToVote.map((_user) => (
          <Grid item>
            <UserChip key={_user.id} user={_user} />
          </Grid>
        ))}
      </Grid>
    </Grid>
  );
}

const TIMEOUT = 2500
function QuestionComplete({ currentQuestion, getUser }) {
  const [chrissyImage] = useState(images.chrissy[Math.floor(Math.random() * images.chrissy.length)]);
  const [deniseImage] = useState(images.denise[Math.floor(Math.random() * images.denise.length)]);

  const [votedForChrissy, setVotedChrissy] = useState([])
  const [votedForDenise, setVotedDenise] = useState([])
  const [doneVoting, setDoneVoting] =useState(false)
  const [step, setStep] = useState(0)
  useEffect(() => {
    const timer = setTimeout(() => {
      setStep(s  => s+1)
    }, TIMEOUT);
    return () => clearTimeout(timer);

  }, [])
  useEffect(() => {
    console.log(step)
    if ((step + 1) <= Object.keys(currentQuestion.responses).length) {
      const [userId, answer] = Object.entries(currentQuestion.responses)[step]

      const user = getUser(userId)

      if (answer === 'Chrissy') {

          setVotedChrissy(chrissy => {
            if (!chrissy.includes(user.name)){
              return [...chrissy, user.name]
            } else {
              return [...chrissy]
            }
          })
      } else {
        setVotedDenise(denise => {
          if (!denise.includes(user.name)){
            return [...denise, user.name]
          } else {
            return [...denise]
          }
        })
      }
    }

    if ((step + 1) === Object.keys(currentQuestion.responses).length) {
      setDoneVoting(true)
    }



  }, [currentQuestion, step])


  const percentChrissy =  !! votedForChrissy.length ?    ((votedForChrissy.length / (votedForDenise.length + votedForChrissy.length)) * 100).toFixed(2): 0
  const percentDenise =  !! votedForDenise.length ?    ((votedForDenise.length / (votedForDenise.length + votedForChrissy.length)) * 100).toFixed(2): 0

  const winner = votedForChrissy.length === votedForDenise.length ? 'Tied' : votedForChrissy.length >  votedForDenise.length ? 'Chrissy' : 'Denise'
  return (
    <Grid item xs={12}>
      <Grid container spacing={1} direction="row" justify="center" alignItems="center">
        <Grid item xs={12}>
          <Typography variant={"h5"}>{currentQuestion.question}</Typography>
          {!doneVoting && (
              <Typography variant={"h5"}>Voting Tabulating</Typography>
          )}
          {doneVoting && (
              <Typography variant={"h5"}>{winner === 'Tied' ? 'Tied between Denise and Chrissy' : `Winner is ${winner}`}</Typography>
          )}
          {doneVoting && (
              <Typography variant={"h6"}>{winner === 'Tied' ? 'Everyone Drink!!' : winner === 'Chrissy' ? `Drink : ${votedForDenise.length  ? votedForDenise.join(', ') : 'Just Dan I guess since everyone voted the same '}` :`Drink : ${votedForChrissy.length ? votedForChrissy.join(', '): 'Just Dan I guess since everyone voted the same'}` }</Typography>
          )}
        </Grid>
        <Grid item xs={6}>
          <Card
              style={{position: 'relative', overflow:'hidden'}}

          >
            <CardHeader
                title={`Number of Votes : ${votedForChrissy.length}`}
              />
            <CardMedia
                component="img"
                height="350"
                image={chrissyImage}
                title="Chrissy"

            />

            {!! votedForChrissy.length && (
                <div
                    style={{
                      position: 'absolute',
                      bottom: '0',
                      left: '0',
                      color: 'black',
                      backgroundColor: percentChrissy > 50 ? '#2ecc71': parseInt(percentChrissy) === 50 ? '#2980b9': '#e74c3c',
                      width: '100%',
                      height: `${(percentChrissy * .85).toFixed(2)}%`,
                      opacity: 0.5,
                    }}
                >
                </div>
            )}
            <Grid
                container
                spacing={1}
                style={{
                  position: 'absolute',
                  bottom: '10px',
                  left: '10px',
                }}
            >
            {votedForChrissy.map((name, ind) =>
                <Grid
                    item
                    key={ind}
                >
                  <Chip color={percentChrissy > 50 ? 'primary' : 'secondary'} label={name} />
                </Grid>
            )}
            </Grid>

          </Card>
        </Grid>
        <Grid  item xs={6}>
          <Card
              style={{position: 'relative',  overflow:'hidden'}}
          >
            <CardHeader
                title={`Number of Votes : ${votedForDenise.length}`}
              />
            <CardMedia
                component="img"
                height="350"
                image={deniseImage}
                title="Denise"

            />
            {!! votedForDenise.length && (
                <div
                    style={{
                      position: 'absolute',
                      bottom: '0',
                      left: '0',
                      color: 'black',
                      backgroundColor: percentDenise > 50 ? '#2ecc71': parseInt(percentDenise) === 50 ? '#2980b9': '#e74c3c',
                      width: '100%',
                      height: `${(percentDenise * .85).toFixed(2)}%`,
                      opacity: 0.5,
                    }}
                >
                </div>
            )}
            <Grid
              container
              spacing={1}
              style={{
                position: 'absolute',
                bottom: '10px',
                left: '10px',
              }}
            >
              {votedForDenise.map((name, ind) =>
                  <Grid
                      item
                      key={ind}

                  >
                    <Chip color={percentDenise > 50 ? 'primary' : 'secondary'} label={name} />
                  </Grid>
              )}


            </Grid>

          </Card>
        </Grid>
      </Grid>
    </Grid>
  );
}
