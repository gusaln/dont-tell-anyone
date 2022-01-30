import "./style.scss";
import React from "react";
import { classname } from "../../utils";

export default function Card(props) {
  return <div className={classname({ "card--expand": props.expand }, "card")}>{props.children}</div>;
}
