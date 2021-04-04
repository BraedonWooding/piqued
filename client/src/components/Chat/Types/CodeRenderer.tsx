import { FC, useEffect, useState } from "react";
import { TypeAdapterProps } from ".";

import axios from "axios";

export const CodeRenderer: FC<TypeAdapterProps> = ({ url, type, onLoad }: TypeAdapterProps) => {
  const [text, setText] = useState("");

  useEffect(() => {
    axios.get(url).then(resp => setText(resp.data));
  }, [url]);

  if (typeof window === 'undefined') return null;

  const AceEditor = require("react-ace").default;

  require("ace-builds/src-noconflict/theme-monokai");
  require("ace-builds/src-noconflict/theme-github");

  const modelist = require("ace-builds/src-noconflict/ext-modelist");
  type = modelist.getModeForPath(url).mode;
  type = type.substring(type.lastIndexOf("/") + 1);
  require("ace-builds/src-noconflict/mode-" + type);

  let theme = "monokai";
  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
    theme = "github";
  }

  return (
    <AceEditor
      theme={theme}
      mode={type}
      value={text}
      readOnly={true}
      name="unique"
      editorProps={{ $blockScrolling: true }}
    />
  );
};
