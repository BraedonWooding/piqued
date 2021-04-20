import React, { ChangeEvent, FC, useRef } from "react";

interface TranscriptPickerProps {
  transcriptSelect: (transcript: File) => void;
}

export const TranscriptPicker: FC<TranscriptPickerProps> = ({ transcriptSelect }) => {
  const inputFile = useRef<HTMLInputElement>(null);

  const newTranscript = (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target || !e.target.files || e.target.files.length == 0) return;

    transcriptSelect(e.target.files[0]);
  };

  return (
    <div style={{ display: "flex", alignContent: "center" }}>
      <input required type="file" onChange={newTranscript} id="file" ref={inputFile} accept=".pdf" />
    </div>
  );
};
