import React, { /*useState,*/ useReducer } from "react";
// import { Tab, Tabs, TabList, TabPanel } from "react-tabs";
import UIModal from "./UIModal";
import Input from "./Input";
// import AddStaticAppPanel from "./AddStaticAppPanel";
// import AddProxyAppPanel from "./AddProxyAppPanel";
import Arrow from "./Arrow";

const emptyRoute = {
  type: "static",
};

const initialState = {
  name: "",
  routes: []
}

const addReducer = (state, action) => {
  switch (action.type) {
    case "SET_NAME":
      return {
        ...state,
        name: action.payload.name
      }
      case "SET_ROUTE":
        return {
          ...state,
          name: action.payload.name
        }
    default: 
      return state;
  }
}

const RouteEditor = ({dispatch, data, index, ghost}) => {
  return <div>
    <input type="text" placeholder="route" value={data && data.route || ""} onChange={({target: { value }}) => dispatch({type: "SET_ROUTE", payload: {index, route: value}})}/>
    <Arrow />
    <input type="text" placeholder="target" value={data && data.target || ""} onChange={({target: { value }}) => dispatch({type: "SET_TARGET", payload: {index, target: value}})}/>
  </div>
}

const AddModal = ({ close, refresh }) => {
  const [state, dispatch] = useReducer(addReducer, initialState);

  return (
    <UIModal close={close} title="Add App">
      <Input
        title="Name"
        value={state.name}
        onChange={(name) => dispatch({type: "SET_NAME", payload: {name}})}
        placeholder="App Name"
      />
      <button onClick={() => dispatch({type: "ADD_ROUTE"})}></button>
      {state.routes.map((route, i) => 
        <RouteEditor key={i} dispatch={dispatch} data={route} index={i} />
      )}
      <RouteEditor dispatch={dispatch} data={undefined} index={state.routes.length} ghost={true}/>
    </UIModal>
  );
};

export default AddModal;
