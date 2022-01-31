import React, { useEffect } from "react";
import Dashboard from "./components/Dashboard/Dashboard";
import DetailedEnigma from "./components/DetailedEnigma/DetailedEnigma";
import { ProvideEnigmaContext } from "./hooks/useEnigmaContext";

export default function App() {
  useEffect(() => console.log("App rerendered"));

  return (
    <div className="app">
      <ProvideEnigmaContext>
        <DetailedEnigma />
        <Dashboard />
      </ProvideEnigmaContext>
    </div>
  );
}
