import React, { useState } from "react";
import { Tab, Tabs, TabList, TabPanel } from "react-tabs";
import UIModal from "../util/UIModal";
import Input from "../util/Input";
import AddStaticAppPanel from "./AddStaticAppPanel";
import AddProxyAppPanel from "./AddProxyAppPanel";
import { AddGridWrapper } from "./AddGridWrapper";

const AddModal = ({ close }) => {
  const [name, setName] = useState("");
  const [route, setRoute] = useState("");
  const [priority, setPriority] = useState("0");
  const [persist, setPersist] = useState(false);

  return (
    <UIModal close={close} title="Add App">
      <AddGridWrapper>
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
        <Input
          title="Persist"
          type="checkbox"
          value={persist}
          onChange={setPersist}
        />
      </AddGridWrapper>
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
            persist={persist}
            close={close}
          />
        </TabPanel>
        <TabPanel>
          <AddProxyAppPanel
            name={name}
            route={route}
            priority={priority}
            persist={persist}
            close={close}
          />
        </TabPanel>
      </Tabs>
    </UIModal>
  );
};

export default AddModal;
