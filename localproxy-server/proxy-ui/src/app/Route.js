import React from "react";
import styled from "styled-components";

import RouteMapping from "./RouteMapping";

const PriorityWrapper = styled.div`
  text-align: right;
`;

function Route({ route, updateRoute }) {
  return (
    <>
      <RouteMapping route={route} updateRoute={updateRoute} />
      <PriorityWrapper>{route.priority}</PriorityWrapper>
    </>
  );
}

export default Route;
