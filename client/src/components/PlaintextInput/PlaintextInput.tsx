import React from "react";
import "./PlaintextInput.scss";

export default function PlaintextInput(props) {
  const { input, onKeyUpHandler, onPasteHandler } = props;

  return (
    <div className="input">
      <label htmlFor="plaintext">Select the input and type the message</label>
      <input
        id="plaintext"
        value={input}
        onKeyUp={onKeyUpHandler}
        onPaste={onPasteHandler}
        onChange={() => console.log("change")}
      />
    </div>
  );
}
