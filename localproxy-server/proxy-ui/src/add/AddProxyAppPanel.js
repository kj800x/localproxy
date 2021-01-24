import React, { useState } from "react";

import Input from "../util/Input";
import { AddGridWrapper } from "./AddGridWrapper";

const AddProxyAppPanel = ({ name, route, priority, close }) => {
  const [hostname, setHostname] = useState("");
  const [port, setPort] = useState("");
  const [trimRoute, setTrimRoute] = useState(false);

  const addApp = async () => {
    await fetch("/__proxy__/api", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: name || "Default Name",
        name: name || "Default Name",
        routes: [
          {
            static: false,
            route: route || "/default/route",
            priority: parseInt(priority) || 0,
            hostname: hostname || "127.0.0.1",
            port: port || 80,
            trimRoute,
          },
        ],
      }),
    });
    close();
  };

  return (
    <AddGridWrapper>
      <Input
        title="Hostname"
        value={hostname}
        onChange={setHostname}
        placeholder="127.0.0.1"
      />
      <Input title="Port" value={port} onChange={setPort} placeholder={80} />
      <Input
        type="checkbox"
        title="Trim route"
        checked={trimRoute}
        onChange={setTrimRoute}
      />
      <button onClick={addApp}>Add App</button>
    </AddGridWrapper>
  );
};

export default AddProxyAppPanel;
