import "./MessageInput.scss"
import React, { useState } from "react";
import Button from "../Button/Button";

export default function MessageInput(props) {
  const [input, setInput] = useState("");
  const [isLoading, setLoading] = useState(false);

  async function handleEncode(immidiate) {
    setLoading(true);
    props.onMessageInput(input, immidiate);
    setInput("");
    setLoading(false);
  }

  return (
    <div className="box message-input">
      <h3>Message input</h3>
      <small>Type the message and push the button.</small>

      <div className="input">
        <label htmlFor="messageinput">Message input</label>
        <textarea id="messageinput" value={input} onChange={(ev) => setInput(ev.target.value)} />
      </div>

      <div style={{ display: "flex" }}>
        <Button onClick={() => handleEncode(true)} disabled={isLoading}>
          Encode
        </Button>
        <Button onClick={() => handleEncode(false)} disabled={isLoading}>
          Encode slowly
        </Button>
      </div>
    </div>
  );
}
