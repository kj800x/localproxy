import React from "react";

function UIIcon({ Icon, title, color, onClick, iconColor }) {
  return (
    <span
      className="icon"
      title={title}
      style={{
        background: color,
        cursor: onClick ? "pointer" : "cursor",
      }}
      onClick={onClick}
      role={onClick ? "button" : undefined}
    >
      <Icon size=".6em" color={iconColor} />
    </span>
  );
}

export default UIIcon;
