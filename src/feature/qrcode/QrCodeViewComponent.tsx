import { useTranslation } from "react-i18next";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";

const QRCode = require('qrcode.react');

type QrCodeViewComponentPropsType = {
  assetId?: string,
  isOpened: boolean,
  onClose: () => void
}

const QrCodeViewComponent = (props: QrCodeViewComponentPropsType) => {
  const { t } = useTranslation();

  return (
    <Dialog
      open={ props.isOpened }
      fullWidth={ true }
      maxWidth="xs"
      onClose={ props.onClose }>

      <DialogTitle>{ t("view_qr_code") }</DialogTitle>

      <DialogContent>
        <DialogContentText>
          <Typography>{ t("view_qr_code_summary") }</Typography>
        </DialogContentText>
        <Grid
          container
          direction="row"
          alignItems="center"
          justifyContent="center">
          <QRCode value={ `clsu://ludendorff/${ props.assetId }` }/>
        </Grid>
      </DialogContent>

      <DialogActions>
        <Button
          color="primary"
          onClick={ props.onClose }>{ t("close") }</Button>
      </DialogActions>
    </Dialog>
  );
}

export default QrCodeViewComponent;