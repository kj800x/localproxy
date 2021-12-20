import React, { FC } from "react";

const Input: FC<{
  title: string;
  value: string;
  placeholder?: string;
  onChange: (value: string | boolean) => void;
  checked?: boolean;
  type: HTMLInputElement["type"];
}> = ({ title, value, placeholder, onChange, checked, type = "text" }) => {
  return (
    <>
      <label>{title}</label>
      <input
        type={type}
        value={value}
        checked={checked}
        placeholder={placeholder}
        onChange={({ target: { value, checked } }) =>
          onChange(type === "checkbox" ? checked : value)
        }
      />
    </>
  );
};

export default Input;
