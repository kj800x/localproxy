import React from "react";

function UIIcon({ Icon, color, onClick, iconColor }) {
  return (
    <span
      className="icon"
      style={{
        background: color,
        cursor: onClick ? "pointer" : "cursor"
      }}
      onClick={onClick}
      role={onClick ? "button" : undefined}
    >
      <Icon size=".7em" color={iconColor} />
    </span>
  );
}

export default UIIcon;
