import { Box, Grid, IconButton, makeStyles, Typography } from "@material-ui/core";
import { CloseOutlined } from "@material-ui/icons";
import { FC } from "react";

interface FileStatusBarProps {
  files: File[];
  removeFile: (file: File) => void;
}

export const FileStatusBar: FC<FileStatusBarProps> = ({ files, removeFile }) => {
  const classes = useStyles();
  return (
    <Grid>
      {files.map((file, index) => (
        <Box display="flex" key={index}>
          <Typography>{file.name}</Typography>
          <IconButton className={classes.noPadding} size="small" onClick={() => removeFile(file)}>
            <CloseOutlined />
          </IconButton>
        </Box>
      ))}
    </Grid>
  );
};

const useStyles = makeStyles(() => ({
  noPadding: { padding: 0 },
}));
