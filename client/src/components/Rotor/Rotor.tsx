import React, { useEffect, useState } from "react";
import { ALPHABET, cap, getLetterIndex } from "../../services/enigma";
import { classname } from "../../utils";
import Select from "../Select/Select";
import "./Rotor.scss";
import RotorWiring from "./RotorWiring/RotorWiring";

const DOUBLE_ALPHABET = ALPHABET.concat(ALPHABET);

export default function Rotor(props) {
  const {
    name,
    offset,
    dictionary,
    notches,
    stepForwards,
    stepBackwards,
    onOffsetChange,
    onRotorChange,
    availableRotors,
  } = props;

  const [alphabet, setAlphabet] = useState<string[]>(() => DOUBLE_ALPHABET);

  useEffect(() => {
    setAlphabet(DOUBLE_ALPHABET.slice(offset, ALPHABET.length + offset));
  }, [offset]);

  return (
    <div className="rotor">
      <div className="rotor__header">
        <Select
          name={name}
          options={availableRotors}
          nameGetter={(r) => `${r.series} ${r.name}`}
          onSelect={onRotorChange}
        />
      </div>

      <div className="rotor__steps">
        <RotorWiring
          dictionary={dictionary}
          offset={offset}
          stepForwards={stepForwards}
          stepBackwards={stepBackwards}
        />

        {alphabet.map((letter, i) => (
          <div
            className={classname(
              {
                "rotor__step--odd": (i + offset) % 2 === 0,
              },
              "rotor__step"
            )}
            key={i}
            onClick={() => onOffsetChange(getLetterIndex(ALPHABET, letter))}
          >
            <div
              className={classname(
                {
                  "rotor--notch": notches.indexOf(cap(i + offset + 1)) !== -1,
                },
                "rotor__step__content"
              )}
            >
              <span
                className={classname(
                  {
                    rotor__forwards: stepForwards.output === i,
                    rotor__backwards: stepBackwards.input === i,
                  },
                  "rotor__letter"
                )}
              >
                {letter}
              </span>

              <span style={{ flexGrow: 1 }}></span>

              <span
                className={classname(
                  {
                    rotor__forwards: stepForwards.input === i,
                    rotor__backwards: stepBackwards.output === i,
                  },
                  "rotor__letter"
                )}
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
