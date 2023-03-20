import React from "react";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

function UIIcon({ icon, title, color, onClick, iconColor }) {
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
      <FontAwesomeIcon icon={icon} fontSize="0.6em" color={iconColor} />
    </span>
  );
}

export default UIIcon;
