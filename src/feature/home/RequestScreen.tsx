import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  LinearProgress,
  TextField,
  useMediaQuery,
  useTheme,
  makeStyles
} from "@material-ui/core";
import { query, collection, orderBy, where, onSnapshot } from "firebase/firestore";
import { Request } from "../requests/Request";
import RequestList from "../requests/RequestList";
import { useAuthState, usePermissions } from "../auth/AuthProvider";
import { ErrorNoPermissionState } from "../state/ErrorStates";
import {
  requestCollection,
  requestedAssetName,
  petitionerId
} from "../../shared/const";
import { formatDate } from "../../shared/utils";
import { firestore } from "../../index";

const useStyles = makeStyles((theme) => ({
  root: {
    minHeight: '60vh',
    paddingTop: 0,
    paddingBottom: 0,
    '& .MuiList-padding': {
      padding: 0
    }
  },
  textField: {
    width: '100%',
    margin: '0.6em 0',
    '& .MuiListItem-root': {
      borderRadius: theme.spacing(1)
    }
  },
}));

type RequestScreenProps = {
  isOpen: boolean,
  onDismiss: () => void
}

const RequestScreen = (props: RequestScreenProps) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('xs'));
  const [request, setRequest] = useState<Request | undefined>(undefined);
  const { isAdmin } = usePermissions();
  const { user } = useAuthState();
  const classes = useStyles();
  const [isLoading, setLoading] = useState(true);
  const [requests, setRequests] = useState<Request[]>([]);

  useEffect(() => {
    let mounted = true;
    const unsubscribe = onSnapshot(query(collection(firestore, requestCollection),
    where(petitionerId, '==', user?.userId),
    orderBy(requestedAssetName, "asc")), (snapshot) => {
      if (mounted) {
        setRequests(snapshot.docs.map((doc) => doc.data() as Request))
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
      unsubscribe();
    }
  })

  const onRequestDismiss = () => setRequest(undefined);

  return (
    <>
      <Dialog
        fullScreen={isMobile}
        fullWidth={true}
        maxWidth="xs"
        open={props.isOpen}
        onClose={props.onDismiss}>
        <DialogTitle>{t("navigation.sent_requests")}</DialogTitle>
        <DialogContent dividers={true} className={classes.root}>
          {isAdmin
            ? !isLoading
              ? <RequestList
                  isHome={true}
                  requests={requests}
                  onItemSelect={setRequest} />
              : <LinearProgress />
            : <ErrorNoPermissionState />
          }
        </DialogContent>
        <DialogActions>
          <Button color="primary" onClick={props.onDismiss}>{t("button.close")}</Button>
        </DialogActions>
      </Dialog>
      {request &&
        <Dialog
          maxWidth="xs"
          fullWidth={true}
          open={request !== undefined}
          onClose={onRequestDismiss}>
          <DialogTitle>{t("request_details")}</DialogTitle>
          <DialogContent>
            <Box>
              <TextField
                label={t("field.asset")}
                className={classes.textField}
                value={request.asset?.assetName}
                inputProps={{ readOnly: true }} />
              <TextField
                label={t("field.submitted_date")}
                className={classes.textField}
                value={formatDate(request.submittedTimestamp)}
                inputProps={{ readOnly: true }} />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button
              color="primary"
              onClick={onRequestDismiss}>
              {t("button.dismiss")}
            </Button>
          </DialogActions>
        </Dialog>
      }
    </>
  )
}

export default RequestScreen;