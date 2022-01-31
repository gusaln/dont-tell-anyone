import { mdiArrowDownDropCircle } from "@mdi/js";
import Icon from "@mdi/react";
import React, { useState } from "react";
import { classname } from "../../utils";
import "./style.scss";

export default function DiskSelector(props) {
  const [isActive, setActive] = useState(false);

  const valueGetter = props.valueGetter
    ? props.valueGetter
    : (o) => (typeof o === "object" ? o.id : o);
  const nameGetter = props.nameGetter
    ? props.nameGetter
    : (o) => (typeof o === "object" ? o.name : o);

  function onSelect(option) {
    setActive(false);

    props.onSelect(valueGetter(option));
  }

  return (
    <div className={classname({ "select--active": isActive }, "select")}>
      <div className="select__activator" onClick={() => setActive(true)}>
        <h4>{props.name}</h4>

        <Icon path={mdiArrowDownDropCircle} size="1rem" />
      </div>

      <div className="select__list" onMouseLeave={() => setActive(false)}>
        {props.options.map((option, i) => (
          <div className="select__list__item" key={i} onClick={() => onSelect(option)}>
            {nameGetter(option)}
          </div>
        ))}
      </div>
    </div>
  );
}
