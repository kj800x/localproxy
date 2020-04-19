import React from "react";

import "./Tag.css";

export default function Tag({ color, children, hover }) {
  return (
    <div className={"tag-container color-" + color} title={hover}>
      <span className="tag">{children}</span>
    </div>
  );
}
