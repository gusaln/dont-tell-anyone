import "./SingleLetterInput.scss";
import React, { useState } from "react";
import { ALPHABET } from "../../services/enigma";

export default function SingleLetterInput(props) {
  const [input, setInput] = useState("");

  /**
   * @param {KeyboardEvent} ev
   */
  function onKeyUp(ev) {
    ev.preventDefault();
    const key = ev.key;
    // console.log("keyup", { key });

    if (ev.key === "Backspace") {
      props.onBackspace();
      return;
    }

    if (ev.ctrlKey || (ev.key !== " " && ALPHABET.indexOf(key.toUpperCase()) < 0)) {
      return;
    }

    props.onLetterInput(key);
    setInput(key);
  }

  /**
   * @param {ClipboardEvent} ev
   */
  function onPaste(ev) {
    ev.preventDefault();
    // console.log("paste", { text: ev.clipboardData.getData("text") });

    const text = ev.clipboardData.getData("text");

    props.onMessageInput(text);
    setInput(text);
  }

  return (
    <div>
      <h3>Single Letter input</h3>
      <small>Select the input and type a message. It will be encoded as you type.</small>

      <div className="input singleletter-input">
        {/* <label htmlFor="singleletter">Single Letter input</label> */}
        <input id="singleletter" value={input} onKeyUp={onKeyUp} onPaste={onPaste} placeholder="Type a message" />
      </div>
    </div>
  );
}
