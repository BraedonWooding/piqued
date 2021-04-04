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
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);

  const handleCloseMenu = () => setAnchorEl(null);

  const handleEdit = (changedMessage: string) => {
    setEditDialogOpen(false);
    if (changedMessage.trim() == "") {
      setDeleteDialogOpen(true);
    } else {
      onEdit(changedMessage);
      handleCloseMenu();
    }
  };

  const handleDelete = () => {
    onDelete();
    setDeleteDialogOpen(false);
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
              if (option === "Edit") setEditDialogOpen(true);
              else if (option === "Delete") setDeleteDialogOpen(true);
            }}
          >
            {option}
          </MenuItem>
        ))}
        <Dialog
          open={editDialogOpen}
          onClose={() => setEditDialogOpen(false)}
          aria-labelledby="form-dialog-title"
          fullWidth
          maxWidth="sm"
        >
          <DialogTitle id="form-dialog-title">Edit Message</DialogTitle>
          <DialogContent>
            <DialogContentText>Edit your message below:</DialogContentText>
            <TextField
              autoFocus
              onFocus={(el) => el.target.value = el.target.value || message}
              margin="dense"
              id="standard-multiline-flexible"
              label="New Message"
              multiline
              rowsMax={10}
              fullWidth
              defaultValue={undefined}
              onChange={(e) => setMessage(e.currentTarget.value)}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setEditDialogOpen(false)} color="primary">
              Cancel
            </Button>
            <Button onClick={() => handleEdit(message)} color="primary">
              Confirm
            </Button>
          </DialogActions>
        </Dialog>
        <Dialog
          open={deleteDialogOpen}
          onClose={() => setDeleteDialogOpen(false)}
          aria-labelledby="form-dialog-title"
          fullWidth
          maxWidth="sm"
        >
          <DialogTitle id="form-dialog-title">Are you sure you want to delete your message?</DialogTitle>
          <DialogContent>
            <DialogContentText>{initialMessage}</DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteDialogOpen(false)} color="primary">
              Cancel
            </Button>
            <Button onClick={() => handleDelete()} color="primary">
              Delete
            </Button>
          </DialogActions>
        </Dialog>
      </Menu>
    </>
  );
};
