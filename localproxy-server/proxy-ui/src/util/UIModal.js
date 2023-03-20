import React from "react";
import UIIcon from "./UIIcon";
import { faClose } from "@fortawesome/free-solid-svg-icons";

function UIModal({ children, close, title }) {
  return (
    <div className="modal">
      <h3 className="modal-top">
        {title}
        <UIIcon
          color="#d94c53"
          iconColor="#2d3e50"
          icon={faClose}
          onClick={close}
        />
      </h3>
      <div className="modal-children">{children}</div>
    </div>
  );
}

export default UIModal;
