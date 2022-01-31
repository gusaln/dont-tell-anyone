import React from "react";
import { CurrentOutlets, LetterIndexMap } from "../../services/enigma";
import DiskSelector from "../DiskSelector/DiskSelector";
import RotorDisk from "./RotorDisk/RotorDisk";

interface RotorProps {
  offset: number;
  dictionary: LetterIndexMap;
  notches: number[];
  stepForwards?: CurrentOutlets;
  stepBackwards?: CurrentOutlets;
  onOffsetChange: (offset: number) => void;
  onRotorChange: (rotorId: number) => void;
  [x: string]: any;
}

export default function Rotor(props: RotorProps) {
  const { name, onRotorChange, availableRotors, ...rest } = props;

  return (
    <div className="rotor">
      <div className="rotor__selector">
        <DiskSelector
          name={name}
          options={availableRotors}
          nameGetter={(r) => `${r.series} ${r.name}`}
          onSelect={onRotorChange}
        />
      </div>

      <RotorDisk {...rest} />
    </div>
  );
}
