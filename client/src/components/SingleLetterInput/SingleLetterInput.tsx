import React from "react";
import "./SingleLetterInput.scss";

interface SingleLetterInputProps {
  value?: string;
  onKeyboardEvent: (ev: KeyboardEvent) => void;
}

export default function SingleLetterInput({ value = "", onKeyboardEvent }: SingleLetterInputProps) {
  // const [value, setInput] = useState("");

  /**
   * @param {KeyboardEvent} ev
   */
  function onKeyUp(ev) {
    ev.preventDefault();
    onKeyboardEvent(ev);
  }

  /**
   * @param {ClipboardEvent} ev
   */
  function onPaste(ev) {
    ev.preventDefault();
    console.log("paste", { text: ev.clipboardData.getData("text") });

    // const text = ev.clipboardData.getData("text");

    // props.onMessageInput(text);
    // setInput(text);
  }

  return (
    <div>
      <h3>Single Letter input</h3>
      <small>Select the input and type a message. It will be encoded as you type.</small>

      <div className="input singleletter-input">
        {/* <label htmlFor="singleletter">Single Letter input</label> */}
        <textarea
          id="singleletter"
          value={value}
          onKeyUp={onKeyUp}
          onPaste={onPaste}
          placeholder="Type a message"
        />
        {/* <input
          id="singleletter"
          value={value}
          onKeyUp={onKeyUp}
          onPaste={onPaste}
          placeholder="Type a message"
        /> */}
      </div>
    </div>
  );
}
