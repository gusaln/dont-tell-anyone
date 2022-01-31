import React, { useEffect, useState } from "react";
import useEnigmaContext from "../../hooks/useEnigmaContext";
import useStream from "../../hooks/useStream";
import { ALPHABET } from "../../services/enigma";
import Button from "../Button/Button";
import SingleLetterInput from "../SingleLetterInput/SingleLetterInput";
import "./Dashboard.scss";

export default function Dashboard() {
  const { enigmaService } = useEnigmaContext();

  const { plaintext, cyphertext, offsets } = useStream(enigmaService.current.machineState$, {
    plaintext: undefined,
    cyphertext: undefined,
    offsets: [] as number[],
  });

  const [initialOffsets, setInitialOffsets] = useState<number[]>(() => offsets);

  function handleInputKeyboardEvent(ev: KeyboardEvent) {
    enigmaService.current.handleInputKeyboardEvent(ev);
  }

  function handleMessageClear() {
    enigmaService.current.clearPlaintext();
  }

  useEffect(() => console.log("Dashboard rerendered"));

  useEffect(() => {
    if (plaintext == "") setInitialOffsets(offsets);
  }, [plaintext]);

  return (
    <section className="dashboard">
      <div className="dashboard__section">
        <SingleLetterInput value={plaintext} onKeyboardEvent={handleInputKeyboardEvent} />
      </div>

      <div className="dashboard__section">
        <h3>Initial Offsets</h3>
        <small className="dashboard__subtitle">
          The offset of the rotors when a message starts to be written. You will need this to decode
          your message.
        </small>
        <h4>{plaintext === "" ? "..." : initialOffsets.map((i) => ALPHABET[i]).join(", ")}</h4>
      </div>

      <div className="dashboard__section">
        <h3>Plaintext</h3>
        <small className="dashboard__subtitle">Your message will show up here as you type.</small>
        <code className="text text--plain">{plaintext}</code>
      </div>

      <div className="dashboard__section">
        <h3>Cyphertext</h3>
        <small className="dashboard__subtitle">The encoded message will show up here.</small>
        <code className="text text--cypher">{cyphertext}</code>
      </div>

      <div style={{ flexGrow: 1 }}></div>

      <div className="dashboard__section">
        <Button onClick={handleMessageClear}>Clear message</Button>
      </div>
    </section>
  );
}
