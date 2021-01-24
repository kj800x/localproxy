import React, { useState } from "react";

import Input from "../util/Input";
import { AddGridWrapper } from "./AddGridWrapper";

const AddStaticAppPanel = ({ name, route, priority, close }) => {
  const [staticDir, setStaticDir] = useState("");
  const [rootIndexFallback, setRootIndexFallback] = useState(false);
  const [dirListings, setDirListings] = useState(false);

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
            rootIndexFallback,
            dirListings,
          },
        ],
      }),
    });
    close();
  };

  return (
    <AddGridWrapper>
      <Input
        title="Static Directory"
        value={staticDir}
        onChange={setStaticDir}
        placeholder="/a/filesystem/path/"
      />
      <Input
        type="checkbox"
        title="Root Index Fallback"
        value={rootIndexFallback}
        onChange={setRootIndexFallback}
      />
      <Input
        type="checkbox"
        title="Directory Listings"
        value={dirListings}
        onChange={setDirListings}
      />
      <button onClick={addApp}>Add App</button>
    </AddGridWrapper>
  );
};

export default AddStaticAppPanel;
