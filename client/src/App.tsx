import React, { useEffect } from "react";
import Dashboard from "./components/Dashboard/Dashboard";
import Rotors from "./components/Rotors/Rotors";
import { ProvideEnigmaContext } from "./hooks/useEnigmaContext";

export default function App() {
  useEffect(() => console.log("App rerendered"));

  return (
    <div className="app">
      <ProvideEnigmaContext>
        <Rotors />
        <Dashboard />
      </ProvideEnigmaContext>
    </div>
  );
}
