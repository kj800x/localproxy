import React, { useState } from "react";

import Input from "./Input";

const AddStaticAppPanel = ({ name, route, priority, close }) => {
  const [staticDir, setStaticDir] = useState("");
  const [indexFallback, setIndexFallback] = useState(false);
  const [autoIndex, setAutoIndex] = useState(false);

  const addApp = async () => {
    await fetch("/__proxy__/api", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: name || "Default Name",
        name: name || "Default Name",
        routes: [
          {
            static: true,
            route: route || "/default/route",
            priority: parseInt(priority) || 0,
            staticDir: staticDir || "/default/static/dir/",
            indexFallback,
            autoIndex,
          },
        ],
      }),
    });
    close();
  };

  return (
    <div>
      <Input
        title="Static Directory"
        value={staticDir}
        onChange={setStaticDir}
        placeholder="/a/filesystem/path/"
      />
      <Input
        type="checkbox"
        title="Index Fallback"
        value={indexFallback}
        onChange={setIndexFallback}
      />
      <Input
        type="checkbox"
        title="Auto Index"
        value={autoIndex}
        onChange={setAutoIndex}
      />
      <button onClick={addApp}>Add App</button>
    </div>
  );
};

export default AddStaticAppPanel;
