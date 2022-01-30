import React, { useEffect, useState } from "react";
import useEnigmaContext from "../../hooks/useEnigmaContext";
import { ALPHABET } from "../../services/enigma";
import Button from "../Button/Button";
import SingleLetterInput from "../SingleLetterInput/SingleLetterInput";
import "./Dashboard.scss";

export default function Dashboard() {
  const { encode, encodeMessage, clearLastPath, onMoveRotorsBackwards, offsets } =
    useEnigmaContext();

  const [plaintext, setPlaintext] = useState("");
  const [cyphertext, setCyphertext] = useState("");
  const [initialOffsets, setInitialOffsets] = useState(() => offsets.slice());

  function handleLetterInput(letter) {
    if (plaintext === "") {
      setInitialOffsets(offsets.slice());
    }

    setPlaintext((p) => p + letter);
    setCyphertext((c) => c + encode(letter));
  }

  function handleBackspace() {
    if (plaintext === "") {
      return;
    }

    if (plaintext[plaintext.length - 1] != " ") onMoveRotorsBackwards();

    setPlaintext((text) => text.slice(0, text.length - 1));
    setCyphertext((text) => text.slice(0, text.length - 1));
  }

  function handleMessageInput(message, immidiate = true) {
    if (plaintext === "") {
      setInitialOffsets(offsets.slice());
    }

    setPlaintext((p) => p + message);
    setCyphertext((c) => c + encodeMessage(message));
  }

  function handleMessageClear() {
    setPlaintext("");
    setCyphertext("");
    clearLastPath();
  }

  useEffect(() => console.log("Dashboard rerendered"));

  return (
    <section className="dashboard">
      <div className="dashboard__section">
        <SingleLetterInput
          onLetterInput={handleLetterInput}
          onMessageInput={handleMessageInput}
          onBackspace={handleBackspace}
        />
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
