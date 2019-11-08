import React from "react";

const Input = ({
  title,
  value,
  placeholder,
  onChange,
  checked,
  type = "text"
}) => {
  return (
    <div className="form-input">
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
    </div>
  );
};

export default Input;
