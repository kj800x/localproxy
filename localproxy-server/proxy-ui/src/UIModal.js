import React from "react";
import { MdClose } from "react-icons/md";
import UIIcon from "./UIIcon";

function UIModal({ children, close, title }) {
  return (
    <div className="modal">
      <h3 className="modal-top">
        {title}
        <UIIcon
          color="#d94c53"
          iconColor="#2d3e50"
          Icon={MdClose}
          onClick={close}
        />
      </h3>
      <div className="modal-children">{children}</div>
    </div>
  );
}

export default UIModal;
