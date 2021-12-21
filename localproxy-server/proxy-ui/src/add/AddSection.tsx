import { FC } from "react";
import { App } from "../app/App";
import { AppType } from "../app/AppType";

const DRAFT_APP: AppType = {
  id: "localproxy system routes",
  name: "localproxy system routes",
  system: true,
  pid: 12,
  persist: true,
  routes: [
    {
      static: true,
      route: "/__proxy__",
      staticDir: "/usr/local/share/localproxy/proxy-ui/build/",
      priority: 9998,
      type: "ui",
      rootIndexFallback: true,
      dirListings: true,
    },
    {
      static: false,
      route: "/__proxy__/api",
      hostname: "127.0.0.1",
      port: 39017,
      trimRoute: true,
      priority: 9999,
      type: "api",
    },
    {
      static: true,
      route: "/",
      staticDir: "/usr/local/share/localproxy/proxy-ui/build/",
      priority: -1,
      type: "ui",
      rootIndexFallback: true,
      dirListings: true,
    },
  ],
};

// {
//   id: "",
//   name: "",
//   system: false,
//   pid: -1,
//   routes: [],
// };

export const AddSection: FC<{ close: () => void }> = ({ close }) => {
  return (
    <App
      draft={true}
      editable={true}
      app={DRAFT_APP}
      onUpdate={(app) => alert(JSON.stringify(app))}
      onDelete={() => close()}
    />
  );
};
