import React, { useLayoutEffect, useRef, useState } from "react";
import {
  cap,
  DISK_TEETH_HALF_HEIGHT_PX,
  DISK_TEETH_HEIGHT_PX,
  LetterIndexMap,
} from "../../../services/enigma";
import { classname } from "../../../utils";
import "./RotorWiring.scss";

type RotorWiringProps = {
  dictionary: LetterIndexMap;
  offset: number;
  stepForwards: { input?: number; output?: number };
  stepBackwards: { input?: number; output?: number };
  [x: string]: unknown;
};

export default function RotorWiring({
  dictionary,
  offset,
  stepForwards,
  stepBackwards,
}: RotorWiringProps) {
  let containerRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });

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
    <div className="rotor__wiring__container" ref={containerRef}>
      {containerRef.current ? (
        <svg className="rotor__wiring" width={size.width} height={size.height}>
          {Object.entries(dictionary).map(([letterIndex, cypherIndex], i) => {
            let realLetterIndex = cap(Number(letterIndex) - offset);
            cypherIndex = cap(cypherIndex - offset);

            let capLength = size.width * 0.125;
            let plainCapH = DISK_TEETH_HEIGHT_PX * realLetterIndex + DISK_TEETH_HALF_HEIGHT_PX;
            let cypherCapH = DISK_TEETH_HEIGHT_PX * cypherIndex + DISK_TEETH_HALF_HEIGHT_PX;

            return (
              <g key={i}>
                <polyline
                  className={classname(
                    {
                      "rotor--input": stepForwards.input === realLetterIndex,
                      "rotor--output": stepBackwards.input === cypherIndex,
                    },
                    "rotor__wire"
                  )}
                  points={`${size.width},${plainCapH} ${
                    size.width - capLength
                  },${plainCapH} ${capLength},${cypherCapH} 0,${cypherCapH}`}
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
