import React, { useState } from "react";

import Input from "./Input";

const AddProxyAppPanel = ({ name, route, priority, refresh, close }) => {
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
            hostname: hostname || "localhost",
            port: port || 80,
            trimRoute
          }
        ]
      })
    });
    close();
    refresh();
  };

  return (
    <div>
      <Input
        title="Hostname"
        value={hostname}
        onChange={setHostname}
        placeholder="localhost"
      />
      <Input title="Port" value={port} onChange={setPort} placeholder={80} />
      <Input
        type="checkbox"
        title="Trim route"
        checked={trimRoute}
        onChange={setTrimRoute}
      />
      <button onClick={addApp}>Add App</button>
    </div>
  );
};

export default AddProxyAppPanel;
