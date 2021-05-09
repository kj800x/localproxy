import React from "react";
import styled from "styled-components";

const COLORS = {
  oz: {
    border: "#00bda5",
    background: "#e5f8f6",
    color: "#33475b",
  },
  norman: {
    border: "#f2547d",
    background: "#fdedf2",
    color: "#33475b",
  },
  thunderdome: {
    border: "#6a78d1",
    background: "#f0f1fa",
    color: "#33475b",
  },
  marigold: {
    border: "#f5c26b",
    background: "#fef8f0",
    color: "#33475b",
  },
  sorbet: {
    border: "#ff8f59",
    background: "#fff3ee",
    color: "#33475b",
  },
  purple: {
    border: "#bda9ea",
    background: "#f4f0ff",
    color: "#33475b",
  },
  default: {
    border: "black",
  },
  disabled: {
    color: "lightgrey",
  },
};
const getColor = (key) => ({ color, disabled }) => {
  return COLORS[disabled ? "disabled" : color][key] || "inherit";
};

const TagWrapper = styled.div`
  display: inline-flex;
  margin: 0 4px;
  justify-content: center;
  align-items: center;
  height: 1em;
  border: 2px solid;
  color: ${getColor("color")};
  vertical-align: bottom;
  width: ${({ fixedWidth }) => (fixedWidth ? "25px" : "inherit")};
  padding: ${({ fixedWidth }) => (fixedWidth ? "0" : "0 5px")};
  cursor: ${({ clickable }) => (clickable ? "pointer" : "inherit")};
  user-select: ${({ clickable }) => (clickable ? "none" : "inherit")};

  border-color: ${getColor("border")};
  background: ${getColor("background")};

  span {
    font-size: x-small;
  }
`;

export default function Tag({
  color = "default",
  children,
  hover,
  fixedWidth,
  enabled = true,
  disabled = false,
  onClick,
  style,
}) {
  return (
    <TagWrapper
      color={color}
      disabled={!(enabled === true)}
      fixedWidth={fixedWidth}
      clickable={!!onClick && !disabled}
      title={hover}
      onClick={disabled ? () => {} : onClick || (() => {})}
      style={style}
    >
      <span>{children}</span>
    </TagWrapper>
  );
}
