import { useTranslation } from "react-i18next";
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";
import LinearProgress from "@material-ui/core/LinearProgress";
import useMediaQuery from "@material-ui/core/useMediaQuery";
import { useTheme, makeStyles } from "@material-ui/core/styles";

import { usePermissions } from "../auth/AuthProvider";
import { Request } from "./Request";
import RequestList from "./RequestList";
import { ErrorNoPermissionState } from "../state/ErrorStates";
import { usePagination } from "../../shared/pagination";
import {
    requestCollection,
    requestedAssetName
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
    requests: Request[],
    isLoading: boolean,
    hasPrevious: boolean,
    hasNext: boolean,
    onPreviousBatch: () => void,
    onNextBatch: () => void,
    onDismiss: () => void,
    onSelectItem: (request: Request) => void
}

const RequestScreen = (props: RequestScreenProps) => {
    const { t } = useTranslation();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('xs'));
    const { isAdmin } = usePermissions();
    const classes = useStyles();

    const { items, isLoading, isStart, isEnd, getPrev, getNext } = usePagination<Request>(
        firestore.collection(requestCollection)
            .orderBy(requestedAssetName, "asc"), { limit: 15 }
    )

    return (
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
                            onItemSelect={props.onSelectItem}/>
                        : <LinearProgress/>
                    :  <ErrorNoPermissionState/>
                }
            </DialogContent>
            <DialogActions>
                <Button color="primary" onClick={props.onDismiss}>{ t("button.close") }</Button>
            </DialogActions>
        </Dialog>
    )
}

export default RequestScreen;