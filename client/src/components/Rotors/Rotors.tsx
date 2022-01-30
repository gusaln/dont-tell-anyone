import React, { useEffect, useState } from "react";
import useEnigmaContext from "../../hooks/useEnigmaContext";
import { ALPHABET, getAllReflectors, getAllRotors } from "../../services/enigma";
import { classname } from "../../utils";
import Reflector from "../Reflector/Reflector";
import Rotor from "../Rotor/Rotor";
import "./style.scss";

type Step = { input?: number; output?: number };

export default function Rotors() {
  const {
    rotors,
    reflector,
    offsets,
    lastPath: lastPath,
    inputLetter,
    outputLetter,
    enigmaType,
    onOffsetChange,
    onRotorChange,
    onReflectorChange,
    getRotorDictionary,
    getReflectorDictionary,
  } = useEnigmaContext();

  const [rotorsPaths, setRotorsPaths] = useState<{ forwards: Step; backwards: Step }[]>(
    rotors.map(() => ({
      forwards: {
        input: undefined,
        output: undefined,
      } as Step,
      backwards: {
        input: undefined,
        output: undefined,
      } as Step,
    }))
  );
  const [reflectorPath, setReflectorPath] = useState<Step>({
    input: undefined,
    output: undefined,
  });
  const getAvailableRotors = (i) => {
    return getAllRotors().filter((r) => r.id !== rotors[i].id && Boolean(r.thin) == rotors[i].thin);
  };
  const getAvailableReflectors = () => {
    return getAllReflectors().filter((r) => r.id !== reflector.id);
  };

  useEffect(() => console.log("Rotors rerendered"));

  useEffect(() => {
    let newRotorsSteps: { forwards: Step; backwards: Step }[] = rotors.map(() => ({
      forwards: {
        input: undefined,
        output: undefined,
      },
      backwards: {
        input: undefined,
        output: undefined,
      },
    }));
    let newReflectorStep: {} | undefined = undefined;

    lastPath.forEach(([rotorI, oldI, newI]) => {
      if (rotorI === -1) {
        newReflectorStep = { input: oldI, output: newI };
        return;
      }

      if (newReflectorStep) {
        newRotorsSteps[rotorI].backwards = { input: oldI, output: newI };
      } else {
        newRotorsSteps[rotorI].forwards = { input: oldI, output: newI };
      }
    });

    setRotorsPaths(newRotorsSteps);
    setReflectorPath(
      newReflectorStep || {
        input: undefined,
        output: undefined,
      }
    );
  }, [rotors, lastPath]);

  return (
    <section className="rotors-container">
      <div className="level mb-12 px-8 py-16">
        <div className="level-left">
          <h4>
            Type of Enigma: <span>{enigmaType}</span>
          </h4>
        </div>
      </div>

      <div className="rotors">
        <div className="rotors__legend">
          {ALPHABET.map((letter, i) => (
            <div
              key={letter}
              className={classname({
                rotors__input: inputLetter === i,
                rotors__output: outputLetter === i,
              })}
            >
              {letter}
            </div>
          ))}
        </div>

        {rotors.map((rotor, i) => (
          <Rotor
            key={i}
            {...rotor}
            offset={offsets[i]}
            dictionary={getRotorDictionary(i)}
            stepForwards={rotorsPaths[i].forwards}
            stepBackwards={rotorsPaths[i].backwards}
            onOffsetChange={(offset) => onOffsetChange(i, offset)}
            availableRotors={getAvailableRotors(i)}
            onRotorChange={(rotor) => onRotorChange(i, rotor)}
          />
        ))}

        <Reflector
          {...reflector}
          dictionary={getReflectorDictionary()}
          input={reflectorPath.input}
          output={reflectorPath.output}
          availableReflectors={getAvailableReflectors()}
          onReflectorChange={onReflectorChange}
        />
      </div>
    </section>
  );
}
