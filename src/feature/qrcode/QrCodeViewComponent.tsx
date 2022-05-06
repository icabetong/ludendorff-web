import { useTranslation } from "react-i18next";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Grid,
  Typography
} from '@mui/material';
import { QRCodeSVG, QRCodeCanvas } from "qrcode.react";

type QrCodeViewComponentPropsType = {
  assetId?: string,
  isOpened: boolean,
  onClose: () => void
}

const QrCodeViewComponent = (props: QrCodeViewComponentPropsType) => {
  const { t } = useTranslation();

  return (
    <Dialog
      open={props.isOpened}
      fullWidth={true}
      maxWidth="xs"
      onClose={props.onClose}>
      <DialogTitle>{t("dialog.view_qr_code")}</DialogTitle>
      <DialogContent>
        <DialogContentText>{t("dialog.view_qr_code_summary")}</DialogContentText>
        <Grid
          container
          direction="row"
          alignItems="center"
          justifyContent="center">
          <QRCodeCanvas value={`clsu://ludendorff/${props.assetId}`}/>
        </Grid>
      </DialogContent>

      <DialogActions>
        <Button onClick={props.onClose}>{t("button.close")}</Button>
      </DialogActions>
    </Dialog>
  );
}

export default QrCodeViewComponent;