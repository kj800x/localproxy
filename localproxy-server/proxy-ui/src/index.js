import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import "react-tabs/style/react-tabs.css";
import "loaders.css/loaders.css";
import ReactApp from "./ReactApp";

const container = document.getElementById("root");
const root = createRoot(container);
root.render(
  <StrictMode>
    <ReactApp />
  </StrictMode>
);
