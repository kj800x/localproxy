import React from "react";
import styled from "styled-components";

const ArrowWrapper = styled.span`
  font-weight: bold;
  margin: 0 4px;
`;

function Arrow({ className, style }) {
  return (
    <ArrowWrapper className={className} style={style}>
      →
    </ArrowWrapper>
  );
}

export default Arrow;
