import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { cap } from "../../../services/enigma";
import { classname } from "../../../utils";
import "./ReflectorWiring.scss";

function getKey(a, b) {
  return `${a}:${b}`;
}

function getKeys([a, b]) {
  return [getKey(a, b), getKey(b, a)];
}

export default function ReflectorWiring({ dictionary, input, output }) {
  let containerRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });
  const [levels, setLevels] = useState({});

  useEffect(() => {
    const map = new Map();
    let level = 0;
    Object.entries(dictionary).forEach((indexes) => {
      const [keyA, keyB] = getKeys(indexes);
      if (!map.has(keyA)) {
        map.set(keyA, ++level);
        map.set(keyB, level);
      }
    });

    setLevels(Object.fromEntries(map.entries()));
  }, [dictionary]);

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
      {containerRef ? (
        <svg className="reflector__wiring" width={size.width} height={size.height}>
          {Object.entries(dictionary).map(([letterIndex, cypherIndex], i) => {
            const key = getKey(letterIndex, cypherIndex);

            let realLetterIndex = cap(Number(letterIndex));
            let realCypherIndex = cap(Number(cypherIndex));

            const plainCapH = 15 * realLetterIndex + 6;
            const cypherCapH = 15 * realCypherIndex + 6;
            const level = 2 + Math.round((levels[key] * size.width) / 13);

            return (
              <g key={i}>
                <polyline
                  className={classname(
                    {
                      "reflector--input": input === letterIndex,
                      "reflector--output": input === cypherIndex,
                    },
                    "reflector__wire"
                  )}
                  points={`${size.width},${plainCapH} ${level},${plainCapH} ${level},${cypherCapH} ${size.width},${cypherCapH}`}
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
