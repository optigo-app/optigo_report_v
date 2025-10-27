import React, { useRef, useState } from "react";
import { Donut } from "react-dial-knob";

export default function VolumeKnob({ setZoomLevel, zoomLevel }) {
  const audioRef = useRef(null);

  const handleChange = (val) => {
    setZoomLevel(val);
    if (audioRef.current) audioRef.current.volume = val / 100;
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      <Donut
        diameter={100}
        min={0}
        max={5}
        step={1}
        value={zoomLevel}
        theme={{
          donutColor: "#1976d2",
          centerColor: "#121212",
          bgrColor: "#333",
        }}
        onValueChange={handleChange}
      />
      <audio ref={audioRef} src="/sample.mp3" autoPlay loop />
    </div>
  );
}
