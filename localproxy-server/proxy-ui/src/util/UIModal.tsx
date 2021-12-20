import { FC, ReactNode } from "react";
import { MdClose } from "react-icons/md";
import UIIcon from "./UIIcon";

const UIModal: FC<{ children: ReactNode; close: () => void; title: string }> =
  ({ children, close, title }) => (
    <div className="modal">
      <h2 className="modal-top">
        {title}
        <UIIcon
          color="#d94c53"
          iconColor="#e5f5f8"
          Icon={MdClose}
          onClick={close}
        />
      </h2>
      <div className="modal-children">{children}</div>
    </div>
  );

export default UIModal;
