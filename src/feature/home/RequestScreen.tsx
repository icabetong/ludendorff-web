import { useState } from "react";
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

import { Request } from "../requests/Request";
import RequestList from "../requests/RequestList";
import { useAuthState, usePermissions } from "../auth/AuthProvider";
import { ErrorNoPermissionState } from "../state/ErrorStates";
import { usePagination } from "../../shared/pagination";
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

  const onRequestDismiss = () => setRequest(undefined);

  const { items, isLoading, isStart, isEnd, getPrev, getNext } = usePagination<Request>(
    firestore.collection(requestCollection)
      .where(petitionerId, "==", user?.userId)
      .orderBy(requestedAssetName, "asc"), { limit: 15 }
  )

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
                requests={items}
                hasPrevious={isStart}
                hasNext={isEnd}
                onPrevious={getPrev}
                onNext={getNext}
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