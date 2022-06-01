import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Button,
  Container,
  Dialog,
  DialogActions,
  DialogTitle,
  DialogContent,
  Grid,
  TextField,
  useMediaQuery,
  useTheme, Divider,
} from "@mui/material";
import { Timestamp } from "firebase/firestore";
import { AuditLog } from "./Audit";
import { AuditLogDataViewer } from "./AuditLogDataViewer";
import { formatDate } from "../../shared/utils";

type AuditLogViewerProps = {
  isOpen: boolean,
  auditLog?: AuditLog<any>,
  onDismiss: () => void,
}
const AuditLogViewer = (props: AuditLogViewerProps) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const [date, setDate] = useState<Date | undefined>(undefined);
  const smBreakpoint = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    if (props.isOpen) {
      let timestamp = props.auditLog?.timestamp;
      if (timestamp instanceof Timestamp) {
        setDate(timestamp.toDate());
      } else {
        setDate(new Date());
      }
    }
  }, [props.isOpen, props.auditLog]);

  const onDismiss = () => {
    props.onDismiss();
  }

  return (
    <Dialog open={props.isOpen} maxWidth="sm" fullWidth>
      <DialogTitle>{t("dialog.audit_log_view")}</DialogTitle>
      <DialogContent dividers>
        <Container sx={{ py: 1 }}>
          <Grid
            container
            direction={smBreakpoint ? "column" : "row"}
            alignItems="stretch"
            justifyContent="center"
            spacing={smBreakpoint ? 0 : 4}>
            <Grid
              item
              xs={6}
              sx={{ maxWidth: '100%', pt: 0, pl: 0 }}>
              <TextField
                label={t("field.data_type")}
                value={props.auditLog?.dataType}
                InputProps={{ readOnly: true }}/>
              <TextField
                label={t("field.operation")}
                value={props.auditLog?.operation}
                InputProps={{ readOnly: true }}/>
              <TextField
                label={t("field.identifier")}
                value={props.auditLog?.identifier}
                InputProps={{ readOnly: true }}/>
            </Grid>
            <Grid
              item
              xs={6}
              sx={{ maxWidth: '100%', pt: 0, pl: 0 }}>
              <TextField
                label={t("field.name")}
                value={props.auditLog?.user.name}
                InputProps={{ readOnly: true }}/>
              <TextField
                label={t("field.email")}
                value={props.auditLog?.user.email}
                InputProps={{ readOnly: true }}/>
              <TextField
                label={t("field.timestamp")}
                value={formatDate(date)}
                InputProps={{ readOnly: true }}/>
            </Grid>
          </Grid>
          <Divider sx={{ my: 2 }}/>
          { props.auditLog &&
            <AuditLogDataViewer
              dataType={props.auditLog?.dataType}
              data={props.auditLog?.data}/>
          }
        </Container>
      </DialogContent>
      <DialogActions>
        <Button variant="contained" onClick={onDismiss}>
          {t("button.close")}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
export default AuditLogViewer;