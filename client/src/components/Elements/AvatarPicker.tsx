import { Box, Button, Slider } from "@material-ui/core";
import Avatar from "@material-ui/core/Avatar";
import CancelIcon from "@material-ui/icons/Cancel";
import SaveIcon from "@material-ui/icons/Save";
import { useStyles } from "components/Common/FormikUI";
import { ChangeEvent, FC, useRef, useState } from "react";
import AvatarEditor from "react-avatar-editor";

interface AvatarPickerProps {
  initialUrl: string;
  onSaveAvatar: (imageData: File) => Promise<string>;
}

export const AvatarPicker: FC<AvatarPickerProps> = ({ initialUrl, onSaveAvatar }) => {
  const classes = useStyles();
  const [cropperOpened, openCropper] = useState(false);
  const [scale, setScale] = useState(2);
  const [baseUrl, setBaseUrl] = useState(initialUrl);
  const [blob, setBlob] = useState(null);
  const inputFile = useRef<HTMLInputElement>(null);
  const editorRef = useRef<AvatarEditor>(null);

  const newImage = (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target || !e.target.files || e.target.files.length == 0) return;

    const url = (window.URL || window.webkitURL).createObjectURL(e.target.files[0]);
    setBaseUrl(url);
    setBlob(e.target.files[0]);
    openCropper(true);
  };

  return (
    <div>
      <input type="file" onChange={newImage} id="file" ref={inputFile} style={{ display: "none" }} />
      <Box
        className={classes.avatar_root}
        onClick={() => {
          inputFile.current.click();
        }}
      >
        <Avatar className={classes.avatar} src={baseUrl} />
        <Box className={classes.avatar_overlay}>
          <Box>Edit</Box>
        </Box>
      </Box>
      {cropperOpened && (
        <div
          className={classes.avatar_overaly_wrapper}
          onClick={(ev) => {
            ev.stopPropagation();
            ev.nativeEvent.stopImmediatePropagation();
          }}
        >
          <AvatarEditor
            ref={editorRef}
            image={baseUrl}
            width={200}
            height={200}
            border={50}
            borderRadius={100}
            color={[255, 255, 255, 0.6]} // RGBA
            scale={scale}
            rotate={0}
          />
          <Box display="flex" justifyContent="center" alignItems="center">
            <label
              style={{
                fontSize: 12,
                marginRight: 10,
                fontWeight: 600,
              }}
            >
              Zoom
            </label>
            <Slider
              min={1}
              max={10}
              step={0.1}
              value={scale}
              onChange={(e, value) => setScale(value as number)}
              style={{ width: 200 }}
            />
          </Box>
          <Box>
            <Button
              variant="contained"
              color="secondary"
              onClick={() => {
                setScale(2);
                openCropper(false);
                setBaseUrl(initialUrl);
              }}
              startIcon={<CancelIcon />}
              className={classes.margin}
            >
              Cancel
            </Button>
            <Button
              color="primary"
              variant="contained"
              onClick={() => {
                setScale(2);
                openCropper(false);
                onSaveAvatar(blob);
              }}
              startIcon={<SaveIcon />}
            >
              Save
            </Button>
          </Box>
        </div>
      )}
    </div>
  );
};
