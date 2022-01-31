import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import {
  DISK_TEETH_HALF_HEIGHT_PX,
  DISK_TEETH_HEIGHT_PX,
  LetterIndexMap,
} from "../../../services/enigma";
import { classname } from "../../../utils";
import "./ReflectorWiring.scss";

function getSortedPair(a, b): [number, number] {
  return a >= b ? [Number(a), Number(b)] : [Number(b), Number(a)];
}

function getKey(a, b) {
  [a, b] = getSortedPair(a, b);
  return `${a}:${b}`;
}

interface ReflectorWiringProps {
  dictionary: LetterIndexMap;
  input?: number;
  output?: number;
  [x: string]: any;
}

export default function ReflectorWiring({ dictionary, input, output }: ReflectorWiringProps) {
  let containerRef = useRef<HTMLDivElement>(null);
  const letterMap = useRef<Map<number, number>>(new Map<number, number>());
  const [size, setSize] = useState({ width: 0, height: 0 });
  const [levels, setLevels] = useState({});

  useEffect(() => {
    letterMap.current = new Map();

    const letterIndexLevelMap = new Map();
    let level = 2;

    Object.entries(dictionary).forEach(([originalIndex, mappedIndex]) => {
      const [a, b] = getSortedPair(originalIndex, mappedIndex);

      if (!letterMap.current.has(a)) {
        letterIndexLevelMap.set(a, ++level);
        letterMap.current.set(a, b);
      }
    });

    setLevels(Object.fromEntries(letterIndexLevelMap.entries()));
  }, [dictionary]);

  // useEffect(() => {
  //   console.log("[ReflectorWiring] levels changed", { levels, letters: letterMap.current });
  // }, [levels]);

  useLayoutEffect(() => {
    function updateSize() {
      containerRef.current &&
        setSize({
          width: containerRef.current.offsetWidth,
          height: containerRef.current.offsetHeight,
        });
    }
    window.addEventListener("resize", updateSize);
    updateSize();
    return () => window.removeEventListener("resize", updateSize);
  }, [containerRef]);

  return (
    <div className="reflector__wiring__container" ref={containerRef}>
      {containerRef.current ? (
        <svg className="reflector__wiring" width={size.width} height={size.height}>
          {Array.from(letterMap.current.entries()).map(([letterIndex, cypherIndex]) => {
            const key = getKey(letterIndex, cypherIndex);
            const [trueLetterIndex, trueCypherIndex] = getSortedPair(letterIndex, cypherIndex);
            // let [trueLetterIndex, trueCypherIndex] = getSortedPair()
            // let [trueInput, trueOutput] = getSortedPair(input, output);

            // let trueLetterIndex = cap(Number(letterIndex));
            // let trueCypherIndex = cap(Number(cypherIndex));

            const plainCapY = DISK_TEETH_HEIGHT_PX * trueLetterIndex + DISK_TEETH_HALF_HEIGHT_PX;
            const cypherCapY = DISK_TEETH_HEIGHT_PX * trueCypherIndex + DISK_TEETH_HALF_HEIGHT_PX;
            const middleCapY = Math.round(
              Math.min(plainCapY, cypherCapY) + Math.abs(plainCapY - cypherCapY) / 2
            );
            const wireBendX = 2 + Math.round((levels[trueLetterIndex] * size.width) / 13);

            // console.log(key, { input, output, letterIndex, cypherIndex });

            return (
              <g id={key} key={key}>
                <polyline
                  className={classname(
                    {
                      "reflector--input": input == letterIndex,
                      "reflector--output": output == letterIndex,
                    },
                    "reflector__wire"
                  )}
                  points={`${size.width},${plainCapY} ${wireBendX},${plainCapY} ${wireBendX},${
                    middleCapY + 1
                  }`}
                  fill="none"
                />

                <polyline
                  className={classname(
                    {
                      "reflector--input": input == cypherIndex,
                      "reflector--output": output == cypherIndex,
                    },
                    "reflector__wire"
                  )}
                  points={`${wireBendX},${middleCapY - 1} ${wireBendX},${cypherCapY} ${
                    size.width
                  },${cypherCapY}`}
                  fill="none"
                />
              </g>
            );
          })}
        </svg>
      ) : undefined}
    </div>
  );
}
