import React from "react";
import Typography from "@material-ui/core/Typography";

export default function UserChip(props) {
  const { user } = props;
  const { name } = user;

  const backgroundColor = user.sockets.length ? '#3498db' : '#95a5a6';
  const borderColor = user.owner ? '#f1c40f' : backgroundColor;

  return (
    <div
      style={{
        backgroundColor,
        paddingTop: 2,
        paddingBottom: 2,
        paddingLeft: 8,
        paddingRight: 8,
        borderRadius: 100,
        borderColor,
        borderSize: 1,
        borderStyle: 'solid',
        color: 'white'
      }}
    >
      <Typography>{name}</Typography>
    </div>
  );
}
