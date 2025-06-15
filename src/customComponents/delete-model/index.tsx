import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Modal } from "@mui/material"

interface DeleteDataModelProps {
    showModel: boolean;
    toggle: (show: boolean) => void;
    onClick: () => void;
    title?: string;
    description?: string;
}

const DeleteDataModel = (props: DeleteDataModelProps) => {
    const {
        showModel,
        toggle,
        onClick,
        title = "Are you Sure?",
        description = "Are you sure you would like to delete this item?"
    } = props;

    return (
        <div>
            <Dialog
                open={showModel}
                onClose={() => toggle(!showModel)}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title">{title}</DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        {description}
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button color='success' onClick={() => onClick()} >
                        YES
                    </Button>
                    <Button color='error' onClick={() => toggle(!showModel)}>
                        NO
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    )
}

export default DeleteDataModel
