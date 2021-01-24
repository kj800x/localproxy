import styled from "styled-components";

export const AddGridWrapper = styled.div`
  display: grid;
  grid-template-columns: 2fr 5fr;
  column-gap: 10px;
  row-gap: 20px;

  button {
    grid-column-start: 1;
    grid-column-end: 3;
    justify-self: end;
  }

  & ~ .react-tabs {
    margin-top: 12px;
  }
`;
