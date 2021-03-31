import { Box, makeStyles } from "@material-ui/core";
import { useStyles } from "components/Common/FormikUI";
import React, { ChangeEvent, useRef } from "react";

interface TranscriptPickerProps {
  initialUrl: string;
  onSaveAvatar: (imageData: File) => Promise<string>;
  disabled: boolean;
}

export const TranscriptPicker = ({ }) => {
  const classes = useStyles();
  const uploadClasses = createStyles();
  const inputFile = useRef<HTMLInputElement>(null);

  const newFile = (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target || !e.target.files || e.target.files.length == 0) return;

    const url = (window.URL || window.webkitURL).createObjectURL(e.target.files[0]);
    // setBaseUrl(url);
  };

  return (
    <div style={{ display: "flex", alignContent: "center" }}>
      <input type="file" onChange={newFile} id="file" ref={inputFile} accept=".pdf" />
      <Box
        className={classes.avatar_root}
        onClick={() => inputFile.current.click()}
      >

        {/* <FileCopyOutlined className={uploadClasses.upload_icon} />
        <Box className={uploadClasses.upload_overlay}>
          <Box>Edit</Box>
        </Box> */}
      </Box>
    </div>
  );
};

const createStyles = makeStyles(() => ({
  upload_icon: {
    width: "300px",
    height: "200px",
    borderRadius: "5px"
  },
  upload_overlay: { width: "100%", height: "100%" },
  // upload_field: { display }
}));
