import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    LinearProgress,
    useMediaQuery,
    useTheme,
    makeStyles
} from "@material-ui/core";
import { useSnackbar } from "notistack";

import { Request, RequestRepository } from "./Request";
import RequestList from "./RequestList";
import { useAuthState, usePermissions } from "../auth/AuthProvider";
import { ErrorNoPermissionState } from "../state/ErrorStates";
import { minimize } from "../user/User";
import { usePagination } from "../../shared/pagination";
import {
    requestCollection,
    requestedAssetName,
    endorser
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
    const [request, setRequest] = useState<Request | undefined>(undefined);
    const { isAdmin } = usePermissions();
    const { user } = useAuthState();
    const classes = useStyles();
    const { enqueueSnackbar } = useSnackbar();

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

    const { items, isLoading, isStart, isEnd, getPrev, getNext } = usePagination<Request>(
        firestore.collection(requestCollection)
            .where(endorser, "==", null)
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
                <DialogTitle>{ t("navigation.requests") }</DialogTitle>
                <DialogContent dividers={true} className={classes.root}>
                    { isAdmin
                        ? !isLoading
                            ? <RequestList 
                                requests={items}
                                hasPrevious={isStart}
                                hasNext={isEnd}
                                onPrevious={getPrev}
                                onNext={getNext}
                                onItemSelect={setRequest}/>
                            : <LinearProgress/>
                        :  <ErrorNoPermissionState/>
                    }
                </DialogContent>
                <DialogActions>
                    <Button color="primary" onClick={props.onDismiss}>{ t("button.close") }</Button>
                </DialogActions>
            </Dialog>
            { request &&
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