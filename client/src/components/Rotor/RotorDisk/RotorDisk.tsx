import React, { useEffect, useState } from "react";
import {
  ALPHABET,
  cap,
  CurrentOutlets,
  getLetterIndex,
  LetterIndexMap,
} from "../../../services/enigma";
import { classname } from "../../../utils";
import RotorWiring from "../RotorWiring/RotorWiring";
import "./style.scss";

const DOUBLE_ALPHABET = ALPHABET.concat(ALPHABET);

interface RotorProps {
  offset: number;
  dictionary: LetterIndexMap;
  notches: number[];
  stepForwards?: CurrentOutlets;
  stepBackwards?: CurrentOutlets;
  onOffsetChange: (offset: number) => void;
  [x: string]: any;
}

export default function RotorDisk(props: RotorProps) {
  const {
    offset,
    dictionary,
    notches,
    stepForwards = { input: -1, output: -1 },
    stepBackwards = { input: -1, output: -1 },
    onOffsetChange,
  } = props;

  const [alphabet, setAlphabet] = useState<string[]>(DOUBLE_ALPHABET);

  useEffect(() => {
    setAlphabet(DOUBLE_ALPHABET.slice(offset, ALPHABET.length + offset));
  }, [offset]);

  return (
    <div className="rotor__disk">
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
  );
}
