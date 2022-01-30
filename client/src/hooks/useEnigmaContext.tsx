import React, { createContext, useCallback, useContext, useRef, useState } from "react";
import {
  ALPHABET,
  Enigma,
  getAllReflectors,
  getAllRotors,
  getLetterIndex,
  ReflectorDefinition,
  RotorDefinition,
} from "../services/enigma";
import { reflectorsIndex, rotorsIndex } from "../services/enigma/rotor";

function useEnigmaController() {
  const enigma = useRef(
    new Enigma(
      [rotorsIndex.army.III, rotorsIndex.army.II, rotorsIndex.army.I],
      reflectorsIndex.common.B
    )
  );
  const [rotors, setRotors] = useState(() => enigma.current.getRotors());
  const [reflector, setReflector] = useState(() => enigma.current.getReflector());
  const [offsets, setOffsets] = useState(() => enigma.current.getOffsets());
  const [lastPath, setSteps] = useState<[number, number, number][]>([]);
  const [inputLetter, setInputLetter] = useState<number>(-1);
  const [outputLetter, setOutputLetter] = useState<number>(-1);
  const [enigmaType, setEnigmaType] = useState(() => enigma.current.getType());

  /**
   * Encodes a single letter and updates the input and output
   */
  const encode = useCallback((letter) => {
    const steps: [number, number, number][] = [];
    const stepsCb = (rotorI, oldI, newI) => steps.push([rotorI, oldI, newI]);
    const code = enigma.current.encode(letter, stepsCb);

    setInputLetter(getLetterIndex(ALPHABET, letter.toUpperCase()));
    setOutputLetter(getLetterIndex(ALPHABET, code));

    setSteps(steps);
    setOffsets(enigma.current.getOffsets());

    return code;
  }, []);

  const encodeMessage = useCallback((msg) => {
    const code = enigma.current.encodeMessage(msg);
    setSteps([]);
    setOffsets(enigma.current.getOffsets());

    return code;
  }, []);

  const onMoveRotorsBackwards = useCallback(() => {
    enigma.current.rotateBackwards(0);
    setSteps([]);
    setOffsets(enigma.current.getOffsets());
  }, []);

  const onOffsetChange = useCallback((i, offset) => {
    enigma.current.setOffset(i, offset);
    setSteps([]);
    setOffsets(enigma.current.getOffsets());
  }, []);

  const onRotorChange = useCallback(
    (i, rotorId) => {
      const _rotors = enigma.current.getRotors();

      const rotorIndexInMachine = _rotors.findIndex((r) => r.id === rotorId);
      if (rotorIndexInMachine >= 0) {
        const currentRotor = _rotors[i];

        enigma.current.setRotor(i, _rotors[rotorIndexInMachine]);
        enigma.current.setRotor(rotorIndexInMachine, currentRotor);
        onOffsetChange(rotorIndexInMachine, 0);
      } else {
        enigma.current.setRotor(i, getAllRotors().find((r) => r.id === rotorId) as RotorDefinition);
      }

      setSteps([]);
      setRotors(enigma.current.getRotors());
      setEnigmaType(enigma.current.getType());
      onOffsetChange(i, 0);
    },
    [onOffsetChange]
  );

  const onReflectorChange = useCallback((reflectorId) => {
    enigma.current.setReflector(
      getAllReflectors().find((r) => r.id === reflectorId) as ReflectorDefinition
    );
    setSteps([]);
    setReflector(enigma.current.getReflector());
  }, []);

  const clearLastPath = useCallback(() => {
    setSteps([]);
  }, []);

  const getRotorDictionary = useCallback(
    (rotorIdx) => enigma.current.getRotorDictionary(rotorIdx),
    []
  );
  const getReflectorDictionary = useCallback(() => enigma.current.getReflectorDictionary(), []);

  return {
    offsets,
    rotors,
    reflector,
    setReflector,
    lastPath,
    inputLetter,
    outputLetter,
    enigmaType,
    onOffsetChange,
    onRotorChange,
    onReflectorChange,
    onMoveRotorsBackwards,
    encode,
    encodeMessage,
    clearLastPath,
    getRotorDictionary,
    getReflectorDictionary,
  };
}

const EnigmaContext = createContext<ReturnType<typeof useEnigmaController>>({} as any);

export default function useEnigmaContext() {
  return useContext(EnigmaContext);
}

export function ProvideEnigmaContext({ children }: any) {
  const enigmaController = useEnigmaController();

  return <EnigmaContext.Provider value={enigmaController}> {children} </EnigmaContext.Provider>;
}
