import { Box, Button, Slider, TextField, Grid } from "@material-ui/core";
import Avatar from "@material-ui/core/Avatar";
import CancelIcon from "@material-ui/icons/Cancel";
import SaveIcon from "@material-ui/icons/Save";
import clsx from "clsx";
import { useStyles } from "components/Common/FormikUI";
import { ChangeEvent, FC, useRef, useState } from "react";
import ImageIcon from '@material-ui/icons/Image';

interface ShortcutCreatorProps {
  id: string;
  index: number;
  initialUrl: string;
  initialShortcut: string;
  onSave: (imageUrl: string, shortcutName: string, shortcutId: string, extension: string) => Promise<void>;
  onDelete: (id: string) => void;
}

export const ShortcutCreator: FC<ShortcutCreatorProps> = ({ id, index, initialUrl, initialShortcut, onSave, onDelete }) => {
  const classes = useStyles();
  const [baseUrl, setBaseUrl] = useState(initialUrl);
  const [shortcutImage, setShortcutImage] = useState(null);
  const [shortcut, setShortcut] = useState(initialShortcut);
  const inputFile = useRef<HTMLInputElement>(null);
  const [imageRequired, setImageRequired] = useState(false);
  const [nameRequired, setNameRequired] = useState(false);
  const [extension, setExtension] = useState<string>()

  const newImage = (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target || !e.target.files || e.target.files.length == 0) {
      setNameRequired(false);
      if (shortcut.length > 0) {
        setImageRequired(true); // We need an image if we removed it
      }
      return;
    }
    if (shortcut.length > 0) {
      setImageRequired(false); // We already have an image
    }
    setNameRequired(true);
    const url = (window.URL || window.webkitURL).createObjectURL(e.target.files[0]);
    const ext = e.target.files[0].name.substring(e.target.files[0].name.lastIndexOf(".") + 1);
    setExtension(ext);
    setBaseUrl(url);
    setShortcutImage(e.target.files[0]);
    onSave(url, shortcut, id, ext);
  };

  return (
    <div>
      <Grid container spacing={1} alignItems="center" justify="center" className={classes.smallMargin}>
        <Grid item>
          <TextField 
            name={`shortcutName-${index}`}
            required={nameRequired}
            value={shortcut}
            onChange={
              (e) => {
                setShortcut(e.target.value);
                if (e.target.value != "") {
                  if (shortcutImage == null) {
                    setImageRequired(true)
                  }
                } else {
                  setImageRequired(false)
                }
                onSave(shortcutImage, shortcut, id, extension);
              }
            }
          />
        </Grid>
        <Grid item>
          <input name={`shortcutImage-${index}`} required={imageRequired} type="file" onChange={newImage} id="file" ref={inputFile} style={{ display: "none" }} />
          <Box
            className={classes.avatar_root}
            onClick={() => inputFile.current.click()}
          >
            <Avatar variant='rounded' className={classes.shortcutImage} src={baseUrl}>
                {baseUrl == "" &&
                    <ImageIcon/>
                }
            </Avatar>
          </Box>
        </Grid>
        <Grid item>
          <Button onClick={() => {onDelete(id)}}>
            Delete
          </Button>
        </Grid>
      </Grid>
      {
        imageRequired ? 
        <p style={{ textAlign: 'right', color: 'red', fontSize: '8px' }}>Please upload an image for for this shortcut</p>
        : null
      }
    </div>
  );
};