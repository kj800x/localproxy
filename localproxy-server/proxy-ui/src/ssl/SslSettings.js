import React, { useState, useCallback } from "react";
import styled from "styled-components";
import classNames from "classnames";
import useApi from "../util/useApi";
import Loader from "react-loaders";

const SslSettingsWrapper = styled.div`
  display: grid;
  column-gap: 10px;
  row-gap: 20px;

  button {
    justify-self: end;
  }

  .result,
  .status {
    grid-column-start: 1;
    grid-column-end: 4;
    text-align: center;
    margin-top: -8px;
  }

  .result {
    color: #00a38d;
  }
  .result.error {
    color: #d94c71;
  }

  .download-title {
    grid-column-start: 1;
    grid-column-end: 3;
  }
`;

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

async function downloadCert({ hostname }) {
  const res = await fetch("/__proxy__/api/ssl/cert");
  const text = await res.text();
  download(`rootCA-${hostname}.pem`, text);
}

const Trust = ({ editingEnabled }) => {
  const [trustValue, setTrustValue] = useState("");
  const [trustResult, setTrustResult] = useState("");
  const trust = useCallback(async () => {
    try {
      setTrustResult("");
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
      {editingEnabled && (
        <>
          <input
            type="text"
            value={trustValue}
            onChange={(event) => setTrustValue(event.target.value)}
          />
          <button onClick={trust}>Trust</button>
        </>
      )}
      {trustList ? (
        <div className="status">
          {trustList
            .map((t) => t.split(" ")[t.split(" ").length - 1])
            .join(", ")}
        </div>
      ) : (
        <div className="status">
          <Loader type="ball-pulse" />
        </div>
      )}
      {trustResult ? (
        <div
          className={classNames("result", {
            error: trustResult.includes("Error:"),
          })}
        >
          {trustResult}
        </div>
      ) : null}
    </>
  );
};

const Hostnames = ({ editingEnabled }) => {
  const [hostname, setHostname] = useState("");
  const [addHostnameResult, setAddHostnameResult] = useState("");
  const addHostname = useCallback(async () => {
    try {
      setAddHostnameResult("");
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
      {editingEnabled && (
        <>
          <input
            type="text"
            value={hostname}
            onChange={(event) => setHostname(event.target.value)}
          />
          <button onClick={addHostname}>Add</button>
        </>
      )}
      {hostnames ? (
        <div className="status">{hostnames.join(", ")}</div>
      ) : (
        <div className="result">
          <Loader type="ball-pulse" />
        </div>
      )}
      {addHostnameResult ? (
        <div
          className={classNames("result", {
            error: addHostnameResult.includes("Error:"),
          })}
        >
          {addHostnameResult}
        </div>
      ) : null}
    </>
  );
};

const Download = ({ hostname }) => {
  return (
    <>
      <h3 className="download-title">Download Cert</h3>
      <button onClick={() => downloadCert({ hostname })}>Download</button>
    </>
  );
};

export const SslSettings = ({ isLocal, hostname }) => {
  return (
    <SslSettingsWrapper>
      <Trust editingEnabled={isLocal} />
      <Hostnames editingEnabled={isLocal} />
      <Download hostname={hostname} />
    </SslSettingsWrapper>
  );
};
