// page.js
"use client";
import React, { useState } from "react";
import DrawPanel from "./draw";
import "./draw.css";

export default function Page() {
  const [mode, setMode] = useState("text");

  return (
    <div style={{ display: "flex", padding: "20px", gap: "30px" }}>
      <div>
        <h2>Current Mode: {mode}</h2>
        <button onClick={() => setMode("text")} style={{ marginRight: "10px" }}>
          Text Mode
        </button>
        <button onClick={() => setMode("draw")}>Draw Mode</button>
      </div>

      <DrawPanel mode={mode} />
    </div>
  );
}
