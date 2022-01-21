import ReactTooltip from "rc-tooltip";

import "./tooltip-adjustments.css";
import "rc-tooltip/assets/bootstrap.css";

export const Tooltip = ({ children, overlay }) => {
  return (
    <ReactTooltip
      placement="bottom"
      destroyTooltipOnHide={true}
      trigger={["click"]}
      overlay={overlay}
    >
      {children}
    </ReactTooltip>
  );
};
