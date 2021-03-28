import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  Menu,
  MenuItem,
  TextField,
} from "@material-ui/core";
import { MoreVert } from "@material-ui/icons";
import React, { FC, useState } from "react";

interface EditDeleteChatMsgButtonProps {
  initialMessage: string;
  onEdit: (changedMessage: string) => void;
  onDelete: () => void;
}

export const EditDeleteChatMsgButton: FC<EditDeleteChatMsgButtonProps> = ({ initialMessage, onEdit, onDelete }) => {
  const options = [];
  if (initialMessage.trim()) {
    options.push("Edit");
  }
  options.push("Delete");

  const [message, setMessage] = useState(initialMessage);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const handleOpenEditDialog = () => setEditDialogOpen(true);
  const handleCloseEditDialog = () => setEditDialogOpen(false);
  const handleCloseMenu = () => setAnchorEl(null);

  const handleEdit = (changedMessage: string) => {
    onEdit(changedMessage);
    handleCloseEditDialog();
    handleCloseMenu();
  };

  const handleDelete = () => {
    onDelete();
    handleCloseMenu();
  };

  return (
    <>
      <IconButton
        aria-label="more"
        aria-controls="long-menu"
        aria-haspopup="true"
        onClick={(e) => setAnchorEl(e.currentTarget)}
      >
        <MoreVert />
      </IconButton>
      <Menu
        id="long-menu"
        anchorEl={anchorEl}
        keepMounted
        open={Boolean(anchorEl)}
        onClose={handleCloseMenu}
        PaperProps={{
          style: {
            maxHeight: 90,
            width: "20ch",
          },
        }}
      >
        {options.map((option, index) => (
          <MenuItem
            key={index}
            onClick={() => {
              if (option === "Edit") handleOpenEditDialog();
              else if (option === "Delete") handleDelete();
            }}
          >
            {option}
          </MenuItem>
        ))}
        <Dialog
          open={editDialogOpen}
          onClose={handleCloseEditDialog}
          aria-labelledby="form-dialog-title"
          fullWidth
          maxWidth="sm"
        >
          <DialogTitle id="form-dialog-title">Edit Message</DialogTitle>
          <DialogContent>
            <DialogContentText>Edit your message below:</DialogContentText>
            <TextField
              autoFocus
              margin="dense"
              id="standard-multiline-flexible"
              label="New Message"
              multiline
              rowsMax={10}
              fullWidth
              defaultValue={message}
              onChange={(e) => setMessage(e.currentTarget.value)}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseEditDialog} color="primary">
              Cancel
            </Button>
            <Button onClick={() => handleEdit(message)} color="primary">
              Send
            </Button>
          </DialogActions>
        </Dialog>
      </Menu>
    </>
  );
};
