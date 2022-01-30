import React from "react";
import { ALPHABET } from "../../services/enigma";
import { classname } from "../../utils";
import Select from "../Select/Select";
import "./Reflector.scss";
import ReflectorWiring from "./ReflectorWiring/ReflectorWiring";

export default function Reflector(props) {
  const { name, input, output, onReflectorChange, dictionary, availableReflectors } = props;

  return (
    <div className="reflector">
      <div className="rotor__header">
        <Select
          name={name}
          options={availableReflectors}
          nameGetter={(r) => `${r.series} ${r.name}`}
          onSelect={onReflectorChange}
        />
      </div>

      <div className="rotor__steps">
        <ReflectorWiring dictionary={dictionary} input={input} output={output} />

        {ALPHABET.map((letter, i) => (
          <div className="rotor__step" key={i}>
            <div className="rotor__step__content">
              <span
                className={classname({
                  "rotor__forwards rotor--input": input === i,
                  "rotor__backwards rotor--output": output === i,
                })}
              >
                {letter}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
