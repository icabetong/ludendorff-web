import { useTranslation } from "react-i18next";
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";

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
            open={props.isOpened}
            fullWidth={true}
            maxWidth="xs"
            onClose={props.onClose}>

            <DialogTitle>{ t("view_qr_code") }</DialogTitle>

            <DialogContent>
                <DialogContentText>
                    <Typography>{ t("view_qr_code_summary") }</Typography>
                </DialogContentText>
                <Grid container direction="row" alignItems="center" justifyContent="center">
                    <QRCode value={`clsu://ludendorff/${props.assetId}`}/>
                </Grid>
            </DialogContent>

            <DialogActions>
                <Button color="primary" onClick={props.onClose}>{ t("close") }</Button>
            </DialogActions>
        </Dialog>
    );
}

export default QrCodeViewComponent;