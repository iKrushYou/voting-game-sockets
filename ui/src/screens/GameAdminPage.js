import React, { useEffect, useState } from "react";
import io from "socket.io-client";
import { SOCKET_ENDPOINT_DEV, SOCKET_FUNCTIONS } from "../config";
import { useGameContext } from "../context/GameContext";
import Typography from "@material-ui/core/Typography";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import Grid from "@material-ui/core/Grid";
import CircularProgress from "@material-ui/core/CircularProgress";
import UserChip from "../components/UserChip";
import TableCell from "@material-ui/core/TableCell";
import TableRow from "@material-ui/core/TableRow";
import TableHead from "@material-ui/core/TableHead";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import Container from "@material-ui/core/Container";
import Button from "@material-ui/core/Button";
import { handleChangeQuestion, handleFinishQuestion, handleResetGame } from "../functions/GameService";

let socket;

export default function GameAdminPage({ history }) {
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
  const currentQuestion = game?.questions[game?.currentQuestion];
  const users = game?.users.sort((a, b) => b.id.localeCompare(a.id)).sort((a, b) => isOnline(b) - isOnline(a)) || [];
  const getUser = (userId) => users.find((_user) => _user.id === userId);
  const currentUser = getUser(userId);

  return (
    <Container maxWidth={"md"}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Typography variant={"h3"}>Admin Page</Typography>
        </Grid>
        {game ? (
          <>
            <Grid item xs={12}>
              <Typography>
                <b>Players: </b>
              </Typography>
              <Grid container spacing={1}>
                {users.map((_user) => (
                  <Grid item>
                    <UserChip user={_user} />
                  </Grid>
                ))}
              </Grid>
            </Grid>
            <Grid item xs={12}>
              <Typography>
                <b>
                  Current Question [{game.currentQuestion + 1} / {game.questions.length}]:{" "}
                </b>
                {currentQuestion.question}
              </Typography>
              <Typography>
                <b>Current State: </b>
                {currentQuestion.done ? "Results" : "Voting"}
              </Typography>
            </Grid>
            <Grid item xs={12}>
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
                  <Button
                    variant={"outlined"}
                    color={"primary"}
                    onClick={() => handleChangeQuestion(socket, "PREV")}
                    style={{ margin: 4 }}
                  >
                    Prev
                  </Button>
                  <div style={{ flex: 1 }} />
                  <Button
                    variant={"outlined"}
                    color={"primary"}
                    onClick={() => handleChangeQuestion(socket, "NEXT")}
                    style={{ margin: 4 }}
                  >
                    Next
                  </Button>
                  <Button
                    variant={"outlined"}
                    color={"primary"}
                    onClick={() => handleFinishQuestion(socket)}
                    style={{ margin: 4 }}
                  >
                    {currentQuestion.done ? "Back" : "Done"}
                  </Button>
                </div>
              </Grid>
            </Grid>
            <Grid item xs={12}>
              <Typography>
                <b>Votes:</b>
              </Typography>
              <Table>
                <TableHead>
                  <TableRow>
                    {currentQuestion.choices.map((choice) => (
                      <TableCell>{choice}</TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow>
                    {currentQuestion.choices.map((choice) => (
                      <TableCell>
                        <Grid container spacing={1}>
                          {Object.entries(currentQuestion.responses)
                            .filter(([_, responseChoice]) => responseChoice === choice)
                            .map(([userId, responseChoice]) => (
                              <Grid item>
                                <UserChip user={getUser(userId)} />
                              </Grid>
                            ))}
                        </Grid>
                      </TableCell>
                    ))}
                  </TableRow>
                </TableBody>
              </Table>
            </Grid>
            <Grid item xs={12}>
              <Button color={"secondary"} onClick={() => handleResetGame(socket)}>
                Reset Game
              </Button>
            </Grid>
            <Grid item xs={12}>
              <Card style={{ overflow: "scroll" }}>
                <CardContent>
                  <pre>{JSON.stringify(game, null, 2)}</pre>
                </CardContent>
              </Card>
            </Grid>
          </>
        ) : (
          <Grid item xs={12}>
            <div style={{ display: "flex", justifyContent: "center" }}>
              <CircularProgress />
            </div>
          </Grid>
        )}
      </Grid>
    </Container>
  );
}
