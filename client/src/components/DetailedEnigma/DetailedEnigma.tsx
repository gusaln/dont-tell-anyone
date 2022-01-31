import React, { useEffect, useMemo, useState } from "react";
import { map } from "rxjs";
import useEnigmaContext from "../../hooks/useEnigmaContext";
import useStream from "../../hooks/useStream";
import { ALPHABET, getAllReflectors, getAllRotors } from "../../services/enigma";
import { classname } from "../../utils";
import Reflector from "../Reflector/Reflector";
import Rotor from "../Rotor/Rotor";
import "./style.scss";

type Step = { input?: number; output?: number };

export default function DetailedEnigma() {
  const { enigmaService } = useEnigmaContext();

  const enigmaType = useStream(enigmaService.current.type$, "custom");
  const rotors = useStream(enigmaService.current.rotors$, []);
  const reflector = useStream(enigmaService.current.reflector$, undefined);
  const lastPath = useStream(
    enigmaService.current.machineState$.pipe(map((state) => state.path)),
    []
  );
  const offsets = useStream(
    enigmaService.current.machineState$.pipe(map((state) => state.offsets)),
    []
  );
  const lastPlaintextLetter = useStream(enigmaService.current.lastPlaintextLetter$, undefined);
  const lastCyphertextLetter = useStream(enigmaService.current.lastCyphertextLetter$, undefined);
  // const { offsets, lastPath, lastPlaintextLetter, lastCyphertextLetter } = useStream(
  //   enigmaService.current.machineState$.pipe(
  //     map((state) => ({
  //       offsets: state.offsets,
  //       lastPath: state.path,
  //       lastPlaintextLetter: state.plaintext.at(-1),
  //       lastCyphertextLetter: state.cyphertext.at(-1),
  //     }))
  //   ),
  //   { offsets: [], lastPath: [], lastPlaintextLetter: undefined, lastCyphertextLetter: undefined }
  // );

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

  const onOffsetChange = (index: number, offset: number) => {
    enigmaService.current.changeOffset(index as 1 | 2 | 3 | 4, offset);
  };
  const onRotorChange = (index: number, rotorId: number) => {
    console.log("onRotorChange", { index, rotorId });
    const rotor = getAllRotors().find((r) => r.id == rotorId);
    rotor && enigmaService.current.changeRotor(index as 1 | 2 | 3 | 4, rotor);
  };
  const onReflectorChange = (reflectorId: number) => {
    console.log("onReflectorChange", { r: reflectorId });
    const reflector = getAllReflectors().find((r) => r.id == reflectorId);
    reflector && enigmaService.current.changeReflector(reflector);
  };

  const getAvailableRotors = (i) => {
    return getAllRotors().filter((r) => r.id !== rotors[i].id && Boolean(r.thin) == rotors[i].thin);
  };
  const getAvailableReflectors = () => {
    return getAllReflectors().filter((r) => r.id !== reflector?.id);
  };

  useEffect(() => console.log("[Rotors] rerendered"));

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

    lastPath.forEach((path) => {
      if (path.rotorIndex === -1) {
        newReflectorStep = { input: path.plaintextIndex, output: path.cyphertextIndex };
        return;
      }

      if (newReflectorStep) {
        newRotorsSteps[path.rotorIndex].backwards = {
          input: path.plaintextIndex,
          output: path.cyphertextIndex,
        };
      } else {
        newRotorsSteps[path.rotorIndex].forwards = {
          input: path.plaintextIndex,
          output: path.cyphertextIndex,
        };
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

  const rotorsComponents = useMemo(() => {
    return rotors.map((rotor, i) => (
      <Rotor
        key={i}
        {...rotor}
        offset={offsets[i]}
        dictionary={rotor.getForwardsLetterMap()}
        stepForwards={rotorsPaths[i]?.forwards}
        stepBackwards={rotorsPaths[i]?.backwards}
        onOffsetChange={(offset) => onOffsetChange(i, offset)}
        availableRotors={getAvailableRotors(i)}
        onRotorChange={(rotor) => onRotorChange(i, rotor)}
      />
    ));
  }, [rotors, offsets, rotorsPaths]);

  const reflectorComponent = useMemo(() => {
    return (
      reflector && (
        <Reflector
          reflector={reflector}
          input={reflectorPath.input}
          output={reflectorPath.output}
          availableReflectors={getAvailableReflectors()}
          onReflectorChange={onReflectorChange}
        />
      )
    );
  }, [reflector, reflectorPath, onReflectorChange]);

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
          {ALPHABET.map((letter) => (
            <div
              key={letter}
              className={classname({
                rotors__input: lastPlaintextLetter === letter,
                rotors__output: lastCyphertextLetter === letter,
              })}
            >
              {letter}
            </div>
          ))}
        </div>

        {rotorsComponents}

        {reflectorComponent}
      </div>
    </section>
  );
}
