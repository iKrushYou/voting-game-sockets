import React from "react";
import Typography from "@material-ui/core/Typography";
import Tooltip from "@material-ui/core/Tooltip";

export default function UserChip(props) {
  const { user, disabled = false } = props;
  if (!user) return <></>;
  const { name } = user;

  const offline = !user.sockets.length;
  const backgroundColor = !disabled ? "#3498db" : "#95a5a6";
  const borderColor = user.owner ? "#f1c40f" : backgroundColor;

  const tooltipTitle = user.owner ? "Party Leader" : offline ? "User Offline" : "";

  return (
    <Tooltip title={tooltipTitle}>
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
          borderStyle: "solid",
          color: "white",
          opacity: offline ? 0.4 : 1.0,
          transition: "all 0.1s ease-in",
        }}
      >
        <Typography>{name}</Typography>
      </div>
    </Tooltip>
  );
}
