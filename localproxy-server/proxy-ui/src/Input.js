import React from "react";

const Input = ({
  title,
  value,
  placeholder,
  onChange,
  checked,
  type = "text",
}) => {
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
