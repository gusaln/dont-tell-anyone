import React, { useMemo } from "react";
import { ALPHABET, ReflectorDefinition } from "../../services/enigma";
import { Reflector as ReflectorDisk } from "../../services/enigma/rotor";
import { classname } from "../../utils";
import DiskSelector from "../DiskSelector/DiskSelector";
import "./Reflector.scss";
import ReflectorWiring from "./ReflectorWiring/ReflectorWiring";

interface ReflectorProps {
  reflector: ReflectorDisk;
  // dictionary: LetterIndexMap;
  input?: number;
  output?: number;
  availableReflectors: ReflectorDefinition[];
  onReflectorChange: (reflectorId: number) => void;
  [x: string]: any;
}

export default function Reflector(props: ReflectorProps) {
  const { reflector, input, output, onReflectorChange, availableReflectors } = props;

  const wiring = useMemo(() => {
    // console.log("[Reflector] rerendering wiring");

    return (
      <ReflectorWiring
        dictionary={reflector.getForwardsLetterMap()}
        input={input}
        output={output}
      />
    );
  }, [reflector, input, output]);

  // useEffect(() => {console.log("[Reflector] changed")});

  // useEffect(() => {
  //   console.log("[Reflector] input, output change", { input, output });
  // }, [input, output]);

  return (
    <div className="reflector">
      <div className="rotor__selector">
        <DiskSelector
          name={reflector.name}
          options={availableReflectors}
          nameGetter={(r) => `${r.series} ${r.name}`}
          onSelect={onReflectorChange}
        />
      </div>

      <div className="rotor__disk">
        {wiring}

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
