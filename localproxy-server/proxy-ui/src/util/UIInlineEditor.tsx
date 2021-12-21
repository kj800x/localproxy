import { useState, useRef, useLayoutEffect, useEffect, FC } from "react";
import classNames from "classnames";
import styled from "styled-components";

const Editor = styled.input`
  background: inherit;
  color: inherit;
  border: none;
  font-family: inherit;
  font-size: inherit;
  font-weight: inherit;

  &:focus {
    outline: none;
  }

  &.no-content {
    outline: none;
    min-width: 130px;
  }

  &[type="number"].no-content {
    min-width: 20px;
    text-align: right;
  }
`;

export const UIInlineEditor: FC<{
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  placeholder?: string;
  type?: HTMLInputElement["type"];
}> = ({
  disabled = false,
  value: initialValue,
  onChange,
  placeholder,
  type = "text",
}) => {
  const [val, setValue] = useState(initialValue);
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  useLayoutEffect(() => {
    const input = ref.current;
    if (input) {
      input.style.width = "0";
      input.style.width =
        input.scrollWidth + (type === "number" ? 12 : 0) + "px";
    }
  }, [ref, val, type]);

  return (
    <Editor
      ref={ref}
      disabled={disabled}
      className={classNames({ "no-content": val === "" })}
      type={type}
      onChange={(event) => {
        event.stopPropagation();
        event.preventDefault();
        setValue(event.target.value);
      }}
      placeholder={placeholder}
      value={val}
      onKeyDown={(event) => {
        event.stopPropagation();
        if (event.key === "Enter") {
          ref.current && ref.current.blur();
          onChange(val);
        }
      }}
      onBlur={() => {
        onChange(val);
      }}
    />
  );
};
