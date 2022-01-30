import React, { ReactNode } from "react";
import { classname } from "../../utils";
import "./Button.scss";

interface ButtonProps {
  disabled?: boolean;
  small?: boolean;
  onClick?: () => void;
  children: ReactNode;
  [x: string]: unknown;
}

export default function Button(props: ButtonProps) {
  return (
    <div
      className={classname(
        {
          "button--small": !!props.small,
        },
        "button"
      )}
      onClick={props.onClick}
    >
      <button disabled={props.disabled}>{props.children}</button>
    </div>
  );
}
