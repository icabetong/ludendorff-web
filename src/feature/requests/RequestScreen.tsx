import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  LinearProgress,
  ListItem,
  ListItemText,
  useMediaQuery,
  useTheme,
  makeStyles
} from "@material-ui/core";
import { useSnackbar } from "notistack";
import { InstantSearch, connectHits } from "react-instantsearch-dom";
import { HitsProvided } from "react-instantsearch-core";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";

import { Request, RequestRepository } from "./Request";
import RequestList from "./RequestList";
import { useAuthState, usePermissions } from "../auth/AuthProvider";
import { ErrorNoPermissionState } from "../state/ErrorStates";
import { minimize } from "../user/User";
import CustomDialogTitle from "../../components/CustomDialogTitle";
import { SearchBox, Highlight, Provider, Results } from "../../components/Search";
import {
  requestCollection,
  requestedAssetName,
  petitionerName,
  endorserName
} from "../../shared/const";
import { firestore } from "../../index";

const useStyles = makeStyles(() => ({
  root: {
    minHeight: '60vh',
    paddingTop: 0,
    paddingBottom: 0,
    '& .MuiList-padding': {
      padding: 0
    }
  },
  search: {
    minHeight: '60vh'
  },
  searchBox: {
    margin: '0.6em 1em'
  }
}));

type RequestScreenProps = {
  isOpen: boolean,
  onDismiss: () => void
}

const RequestScreen = (props: RequestScreenProps) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('xs'));
  const [search, setSearch] = useState(false);
  const [request, setRequest] = useState<Request | undefined>(undefined);
  const { isAdmin } = usePermissions();
  const { user } = useAuthState();
  const classes = useStyles();
  const { enqueueSnackbar } = useSnackbar();
  const [isLoading, setLoading] = useState(true);
  const [requests, setRequests] = useState<Request[]>([]);

  useEffect(() => {
    let mounted = true;
    const unsubscribe = onSnapshot(query(collection(firestore, requestCollection), orderBy(endorserName, "asc")), (snapshot) => {
      if (mounted) {
        setRequests(snapshot.docs.map((doc) => doc.data() as Request));
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
      unsubscribe();
    }
  }, []);

  const onSearchInvoked = () => setSearch(!search);

  const onEndorsementDismiss = () => setRequest(undefined);
  const onEndorsementConfirmed = () => {
    if (user !== undefined && request !== undefined) {
      const endorser = minimize(user);

      RequestRepository.approve(request, endorser)
        .then(() => enqueueSnackbar(t("feedback.request_endorsed")))
        .catch(() => enqueueSnackbar(t("feedback.request_endorse_error")))
        .finally(onEndorsementDismiss)
    } else enqueueSnackbar(t("feedback.error_generic."))
  }

  return (
    <>
      <Dialog
        fullScreen={isMobile}
        fullWidth={true}
        maxWidth="xs"
        open={props.isOpen}
        onClose={props.onDismiss}>
        <CustomDialogTitle onSearch={onSearchInvoked}>{t("navigation.requests")}</CustomDialogTitle>
        <DialogContent dividers={true} className={classes.root}>
          {search
            ? <InstantSearch searchClient={Provider} indexName="requests">
              <Box className={classes.searchBox}>
                <SearchBox />
              </Box>
              <Box className={classes.search}>
                <Results>
                  <RequestHits onItemSelect={setRequest} />
                </Results>
              </Box>
            </InstantSearch>
            : isAdmin
              ? !isLoading
                ? <RequestList
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
          onClose={onEndorsementDismiss}>
          <DialogTitle>{t("dialog.request_endorse")}</DialogTitle>
          <DialogContent>{t("dialog.request_endorse_summary")}</DialogContent>
          <DialogActions>
            <Button
              color="primary"
              onClick={onEndorsementDismiss}>
              {t("button.cancel")}
            </Button>
            <Button
              color="primary"
              onClick={onEndorsementConfirmed}>
              {t("button.endorse")}
            </Button>
          </DialogActions>
        </Dialog>
      }
    </>
  )
}

export default RequestScreen;

type RequestHitsListProps = HitsProvided<Request> & {
  onItemSelect: (request: Request) => void
}
const RequestHitsList = (props: RequestHitsListProps) => {
  return (
    <>
      {props.hits.map((r: Request) => (
        <RequestListItem request={r} onItemSelect={props.onItemSelect} />
      ))
      }
    </>
  )
}
const RequestHits = connectHits<RequestHitsListProps, Request>(RequestHitsList);

type RequestListItemProps = {
  request: Request,
  onItemSelect: (request: Request) => void
}
const RequestListItem = (props: RequestListItemProps) => {
  return (
    <ListItem
      button
      key={props.request.requestId}
      onClick={() => props.onItemSelect(props.request)}>
      <ListItemText
        primary={<Highlight attribute={requestedAssetName} hit={props.request} />}
        secondary={<Highlight attribute={petitionerName} hit={props.request} />} />
    </ListItem>
  )
}