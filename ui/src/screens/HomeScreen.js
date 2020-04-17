import React, { useRef } from "react";
import { Typography } from "@material-ui/core";
import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";
import Container from "@material-ui/core/Container";
import Grid from "@material-ui/core/Grid";
import { useGameContext } from "../context/GameContext";

export default function HomeScreen({ history }) {
  const { userName, saveUserName } = useGameContext();

  const nameFieldRef = useRef();

  const handleJoin = () => {
    const userNameValue = nameFieldRef.current.value;
    if (!userNameValue) alert("Name can't be empty");

    saveUserName(userNameValue);
    history.push("/game");
  };

  return (
    <>
      <Container maxWidth={"sm"}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Typography>Party Vote</Typography>
          </Grid>
          <Grid item xs={12}>
            <TextField
              label={"Name"}
              inputRef={(ref) => (nameFieldRef.current = ref)}
              defaultValue={userName}
              fullWidth
            />
          </Grid>
          <Grid item xs={12}>
            <Button fullWidth variant={"outlined"} color={"primary"} onClick={handleJoin}>
              Join
            </Button>
          </Grid>
        </Grid>
      </Container>
    </>
  );
}
