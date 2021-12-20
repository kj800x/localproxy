import React, { CSSProperties, FC } from "react";
import styled from "styled-components";

interface Theme {
  border: string;
  background: string;
  color: string;
}
const COLORS: { [key: string]: Theme } = {
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
    background: "inherit",
    color: "#33475b",
  },
  disabled: {
    color: "lightgrey",
    border: "inherit",
    background: "inherit",
  },
};

const getColor =
  (key: keyof Theme) =>
  ({ color, disabled }: { color: keyof typeof COLORS; disabled: boolean }) => {
    return COLORS[disabled ? "disabled" : color][key];
  };

const TagWrapper = styled.div<{
  color: keyof typeof COLORS;
  disabled: boolean;
  fixedWidth: boolean;
  clickable: boolean;
}>`
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

export const Tag: FC<{
  color: keyof typeof COLORS;
  hover: string;
  fixedWidth: boolean;
  enabled: boolean;
  disabled: boolean;
  onClick: () => void;
  style: CSSProperties;
}> = ({
  color = "default",
  children,
  hover,
  fixedWidth,
  enabled = true,
  disabled = false,
  onClick,
  style,
}) => {
  return (
    <TagWrapper
      color={color as string}
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
};
