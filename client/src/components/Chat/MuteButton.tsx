import {
    Button,
    Dialog,
    DialogActions,
    DialogTitle,
} from "@material-ui/core";
import React, { FC, useState } from "react";
import axios from 'axios';

interface MuteButtonProps {
    userId: number;
    groupId: number;
}

export const MuteButton: FC<MuteButtonProps> = ({ userId, groupId }) => {
    const [muteDialogOpen, setMuteDialogOpen] = useState(false);
    const [anchorEl, setAnchorEl] = useState(null);
    const handleOpenMuteDialog = () => setMuteDialogOpen(true);
    const handleCloseMuteDialog = () => setMuteDialogOpen(false);

    const handleMute = (interval: number) => { // Time interval in minutes. If negative, indefinite
        // Send request to mute
        axios.post(process.env.NEXT_PUBLIC_API_URL + "/mute/", {
            "group_id":groupId,
            "minutes":interval
        }).catch((err) => {
            console.log('An error occurred while muting. ', err);
        });
    }
 
    const handleUnmute = () => {
        // Send request to unmute
        axios.post(process.env.NEXT_PUBLIC_API_URL + "/unmute/", {
            "group_id":groupId
        }).catch((err) => {
            console.log('An error occurred while unmuting. ', err);
        });
    }

    const handleMuteClicked = (e) => {
        e.stopPropagation(); // Mute button is nested inside other clickable elements so stop propagation
        handleOpenMuteDialog();
    }

    return (
        <>
            <Button onClick={ (e) => handleMuteClicked(e) }>
                Mute Options
            </Button>
            <Dialog
                open={muteDialogOpen}
                onClose={handleCloseMuteDialog}
                aria-labelledby="form-dialog-title"
                fullWidth
                maxWidth="sm"
            >
                <DialogTitle id="form-dialog-title">Mute this channel</DialogTitle>
                <DialogActions>
                    <Button onClick={ (e) => handleMute(60) } color="primary">
                        Mute for 1 hour
                    </Button>
                    <Button onClick={ (e) => handleMute(-1) } color="primary">
                        Mute until I turn it back on
                    </Button>
                    <Button onClick={ (e) => handleUnmute() } color="primary">
                        Unmute
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};