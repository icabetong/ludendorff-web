import { ElementType } from "react";
import { useTranslation } from "react-i18next";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  Typography,
} from "@mui/material";

type SVGFeedbackDialogProps = {
  svgImage: ElementType,
  title: string,
  description?: string,
  isOpen: boolean,
  onDismiss: () => void
}
const SVGFeedbackDialog = (props: SVGFeedbackDialogProps) => {
  const { t } = useTranslation();

  return (
    <Dialog open={props.isOpen} maxWidth="xs" fullWidth>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <Box component={props.svgImage} sx={{ width: '12em', height: '12em'}}/>
          <Typography align="center" variant="h6">{props.title}</Typography>
          <Typography align="center" variant="subtitle2">{props.description}</Typography>
        </Box>
      </DialogContent>
      <DialogActions>
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 2,
        }}>
          <Button variant="contained" onClick={props.onDismiss}>{t("button.close")}</Button>
        </Box>
      </DialogActions>
    </Dialog>
  )
}

export default SVGFeedbackDialog;