import React, { useState, useEffect } from "react";
import "./Rotor.css";
import { ALPHABET } from "../../utils/rotor";
import { cap } from "../../utils/enigma";
import { classname } from "../../utils";

function getLetterIndex(l) {
  return ALPHABET.indexOf(l);
}

export default function Rotor(props) {
  const { name, offset, notches, ins, outs, onOffsetChange } = props;

  const [alphabet, setAlphabet] = useState(ALPHABET);

  // useEffect(() => console.log("Rotor rerendered", { name }));
  useEffect(() => {
    setAlphabet(ALPHABET.concat(ALPHABET).slice(offset, ALPHABET.length + offset));
  }, [offset]);

  return (
    <div className="rotor">
      <div className="rotor__header">
        <h3>{name}</h3>
      </div>

      <div className="rotor__steps">
        {alphabet.map((letter, i) => (
          <div
            className={classname(
              {
                "rotor__step--odd": (i + offset) % 2 === 0,
              },
              "rotor__step"
            )}
            key={i}
            onClick={() => onOffsetChange(getLetterIndex(letter))}
          >
            <div
              className={classname(
                {
                  "rotor--notch": notches.indexOf(cap(i + offset + 1)) !== -1,
                },
                "rotor__step__content"
              )}
            >
              <div
                className={classname(
                  {
                    "rotor__forwards rotor--output": outs[0] === i,
                    "rotor__backwards rotor--input": ins[1] === i,
                  },
                  "rotor__step__left rotor__legend"
                )}
              >
                {ALPHABET[i]}
              </div>

              <span className={classname({}, "rotor__step__center")}>{letter}</span>

              <div
                className={classname(
                  {
                    "rotor__forwards rotor--input": ins[0] === i,
                    "rotor__backwards rotor--output": outs[1] === i,
                  },
                  "rotor__step__right rotor__legend"
                )}
              >
                {ALPHABET[i]}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
