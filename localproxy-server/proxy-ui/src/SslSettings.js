import React, { useState, useCallback } from "react";
import classNames from "classnames";
import useApi from "./useApi";

import "./SslSettings.css";

function download(filename, text) {
  var element = document.createElement("a");
  element.setAttribute(
    "href",
    "data:text/plain;charset=utf-8," + encodeURIComponent(text)
  );
  element.setAttribute("download", filename);

  element.style.display = "none";
  document.body.appendChild(element);

  element.click();

  document.body.removeChild(element);
}

async function downloadCert() {
  const res = await fetch("/__proxy__/api/ssl/cert");
  const text = await res.text();
  download("rootCA.pem", text);
}

const Trust = () => {
  const [trustValue, setTrustValue] = useState("");
  const [trustResult, setTrustResult] = useState("");
  const trust = useCallback(async () => {
    try {
      await fetch("/__proxy__/api/ssl/trust", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hostname: trustValue }),
      });
      setTrustResult("Remote localproxy server successfully trusted!");
    } catch (e) {
      setTrustResult(`${e.toString()}`);
    }
  }, [trustValue]);

  const { data: trustList } = useApi({
    api: "/__proxy__/api/ssl/trust/list",
    deps: [trustResult],
  });

  return (
    <>
      <h3>Trust</h3>
      <input
        type="text"
        value={trustValue}
        onChange={(event) => setTrustValue(event.target.value)}
      />
      <button onClick={trust}>Trust</button>
      {trustList && (
        <div className="status">
          {trustList
            .map((t) => t.split(" ")[t.split(" ").length - 1])
            .join(", ")}
        </div>
      )}
      {trustResult && (
        <div
          className={classNames("result", {
            error: trustResult.includes("Error:"),
          })}
        >
          {trustResult}
        </div>
      )}
    </>
  );
};

const Hostnames = () => {
  const [hostname, setHostname] = useState("");
  const [addHostnameResult, setAddHostnameResult] = useState("");
  const addHostname = useCallback(async () => {
    try {
      await fetch("/__proxy__/api/ssl/add-hostname", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hostname }),
      });
      setAddHostnameResult("Hostname successfully added!");
    } catch (e) {
      setAddHostnameResult(`${e.toString()}`);
    }
  }, [hostname]);

  const { data: hostnames } = useApi({
    api: "/__proxy__/api/ssl/hostnames/list",
    deps: [addHostnameResult],
  });

  return (
    <>
      <h3>Hostnames</h3>
      <input
        type="text"
        value={hostname}
        onChange={(event) => setHostname(event.target.value)}
      />
      <button onClick={addHostname}>Add</button>
      {hostnames && <div className="status">{hostnames.join(", ")}</div>}
      {addHostnameResult && (
        <div
          className={classNames("result", {
            error: addHostnameResult.includes("Error:"),
          })}
        >
          {addHostnameResult}
        </div>
      )}
    </>
  );
};

const Download = () => {
  return (
    <>
      <h3 className="download-title">Download Cert</h3>
      <button onClick={downloadCert}>Download</button>
    </>
  );
};

export const SslSettings = () => {
  return (
    <div className="ssl-settings">
      <Trust />
      <Hostnames />
      <Download />
    </div>
  );
};
