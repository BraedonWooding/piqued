import { Button, Slider } from "@material-ui/core";
import Avatar from "@material-ui/core/Avatar";
import CancelIcon from "@material-ui/icons/Cancel";
import SaveIcon from "@material-ui/icons/Save";
import { useStyles } from "components/Common/FormikUI";
import React, { FC, useRef, useState } from "react";
import AvatarEditor from "react-avatar-editor";

interface AvatarPickerProps {
  baseUrl: string;
  onSaveAvatar: (imageData: string) => Promise<string>;
}

export const AvatarPicker: FC<AvatarPickerProps> = ({ baseUrl, onSaveAvatar }) => {
    const classes = useStyles();
    let [img, setImage] = useState(baseUrl);
    let [cropperOpened, openCropper] = useState(false);
    let [scale, setScale] = useState(2);

    const newImage = (e: any) => {
      window.URL = window.URL || window.webkitURL;
      let url = window.URL.createObjectURL(e.target.files[0]);
      setImage(url);
      openCropper(true);
    }

    const inputFile = useRef(null);
    const editorRef = useRef(null);

    return (
      <div>
        <input type='file' onChange={newImage} id='file' ref={inputFile} style={{display: 'none'}}/>
        <div className={classes.avatar_root} onClick={() => {inputFile && inputFile.current && inputFile.current.click()}}>
          <Avatar className={classes.avatar} src={img} />
          <div className={classes.avatar_overlay}> <div> Edit </div> </div>
        </div>
        {cropperOpened && (
            <div
              className={classes.avatar_overaly_wrapper}
              onClick={(ev) => { console.log(ev); ev.stopPropagation(); ev.nativeEvent.stopImmediatePropagation(); }}
            >
              <AvatarEditor
                ref={editorRef}
                image={img}
                width={200}
                height={200}
                border={50}
                borderRadius={100}
                color={[255, 255, 255, 0.6]} // RGBA
                scale={scale}
                rotate={0}
              />
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center"
                }}
              >
                <label
                  style={{
                    fontSize: 12,
                    marginRight: 10,
                    fontWeight: 600
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
              </div>
              <div>
                <Button
                  variant="contained"
                  color="secondary"
                  onClick={() => {setImage(baseUrl); setScale(2); openCropper(false); }}
                  startIcon={<CancelIcon />}
                  className={classes.margin}
                >Cancel</Button>
                <Button
                  color="primary"
                  variant="contained"
                  onClick={() => {setImage(baseUrl); setScale(2); openCropper(false); onSaveAvatar(img); }}
                  startIcon={<SaveIcon />}
                >Save</Button>
              </div>
            </div>
          )}
      </div>
    );
  };
