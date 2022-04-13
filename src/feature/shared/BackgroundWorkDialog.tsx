import { Box, Dialog, DialogContent, DialogContentText, DialogTitle, LinearProgress } from "@mui/material";

type BackgroundWorkDialogProps = {
  isOpen: boolean,
  title: string,
  summary: string
}
const BackgroundWorkDialog = (props: BackgroundWorkDialogProps) => {
  const { isOpen, title, summary } = props;

  return (
    <Dialog open={isOpen} maxWidth="xs">
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <DialogContentText>{summary}</DialogContentText>
        <Box sx={{ my: 2 }}>
          <LinearProgress variant="indeterminate"/>
        </Box>
      </DialogContent>
    </Dialog>
  )
}

export default BackgroundWorkDialog;