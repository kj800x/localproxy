import React from "react";

import "./Tag.css";

export default function Tag({ color, children, hover, fixedWidth }) {
  return (
    <div className={"tag-container color-" + color + (fixedWidth ? " tag-fixed-width" : "")} title={hover}>
      <span className="tag">{children}</span>
    </div>
  );
}
