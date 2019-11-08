import React, { useState } from "react";
import { Tab, Tabs, TabList, TabPanel } from "react-tabs";
import UIModal from "./UIModal";
import Input from "./Input";
import AddStaticAppPanel from "./AddStaticAppPanel";
import AddProxyAppPanel from "./AddProxyAppPanel";

const AddModal = ({ close, refresh }) => {
  const [name, setName] = useState("");
  const [route, setRoute] = useState("");
  const [priority, setPriority] = useState("0");

  return (
    <UIModal close={close} title="Manually Add App">
      <Input
        title="Name"
        value={name}
        onChange={setName}
        placeholder={"An App Name"}
      />
      <Input
        title="Route"
        value={route}
        onChange={setRoute}
        placeholder={"/a/route"}
      />
      <Input
        title="Priority"
        type="number"
        value={priority}
        onChange={setPriority}
        placeholder={"0"}
      />
      <Tabs>
        <TabList>
          <Tab>Static</Tab>
          <Tab>Proxy</Tab>
        </TabList>
        <TabPanel>
          <AddStaticAppPanel
            name={name}
            route={route}
            priority={priority}
            refresh={refresh}
            close={close}
          />
        </TabPanel>
        <TabPanel>
          <AddProxyAppPanel
            name={name}
            route={route}
            priority={priority}
            refresh={refresh}
            close={close}
          />
        </TabPanel>
      </Tabs>
    </UIModal>
  );
};

export default AddModal;
