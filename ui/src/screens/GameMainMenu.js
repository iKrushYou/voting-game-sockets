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
import {CardMedia} from "@material-ui/core";
import * as images from '../Image/images'
let socket;

export default function ({ history }) {
    const { userId, userName } = useGameContext();

    const [game, setGame] = useState();
    const [chrissyImage] = useState(images.chrissy[Math.floor(Math.random() * images.chrissy.length)])
    const [deniseImage] = useState(images.chrissy[Math.floor(Math.random() * images.chrissy.length)])

    const users = game?.users.sort((a, b) => b.sockets.length - a.sockets.length) || [];
    const getUser = (userId) => users.find((_user) => _user.id === userId);
    const currentUser = getUser(userId);
    const currentQuestion = game?.questions[game.currentQuestion];



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



    return (
        <Container maxWidth={"md"}>
            <Card>
                <CardContent style={{ backgroundColor: "#ececec" }}>
                    <Grid container spacing={3}>
                        <Grid item xs={12}>
                            <Typography variant={"h3"}>Game Screen Welcome {userName}</Typography>
                        </Grid>
                        {game ? (
                            <>
                                <Grid item xs={12}>
                                    <Grid container spacing={1} style={{ alignItems: "center" }}>
                                        <Grid item>Users in game: </Grid>
                                        {users.map((user) => (
                                            <Grid item key={user.id}>
                                                <Chip
                                                    label={user.name}
                                                    color={user.sockets.length ? (user.owner ? "secondary" : "primary") : "default"}
                                                />
                                            </Grid>
                                        ))}
                                    </Grid>
                                </Grid>
                                <Grid item xs={12}>
                                    <Typography variant={"h5"}>{currentQuestion.question}</Typography>
                                    <Grid container
                                          spacing={1}
                                          direction="row"
                                          justify="center"
                                          alignItems="center"
                                    >
                                        <Grid
                                            item
                                            xs={6}
                                        >
                                            <Card>
                                                <CardMedia
                                                    component="img"
                                                    height="140"
                                                    image={chrissyImage}
                                                    title="Chrissy"
                                                />
                                            </Card>

                                        </Grid>
                                        <Grid
                                            item
                                            xs={6}
                                        >
                                            <Card>
                                                <CardMedia
                                                    component="img"
                                                    alt="Contemplative Reptile"
                                                    height="140"
                                                    image={deniseImage}
                                                    title="Denise"
                                                />
                                            </Card>

                                        </Grid>

                                    </Grid>
                                </Grid>
                                    <Grid item xs={12} style={{ display: "flex" }}>
                                        <Button variant={"outlined"} color={"primary"} onClick={() => handleChangeQuestion("PREV")}>
                                            Prev
                                        </Button>
                                        <div style={{ flex: 1 }} />
                                        <Button variant={"outlined"} color={"primary"} onClick={() => handleChangeQuestion("NEXT")}>
                                            Next
                                        </Button>
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
                </CardContent>
            </Card>
        </Container>
    );
}
