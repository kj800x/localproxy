import { FC } from "react";
import { IconType } from "react-icons/lib";

const UIIcon: FC<{
  Icon: IconType;
  color: string;
  iconColor: string;
  title?: string;
  onClick?: () => void;
}> = ({ Icon, title, color, onClick, iconColor }) => {
  return (
    <span
      className="icon"
      title={title}
      style={{
        background: color,
        cursor: onClick ? "pointer" : "cursor",
      }}
      onClick={onClick}
      role={onClick ? "button" : undefined}
    >
      <Icon size=".6em" color={iconColor} />
    </span>
  );
};

export default UIIcon;
