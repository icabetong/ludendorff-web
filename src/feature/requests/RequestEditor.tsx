import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
    Button,
    Container,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControl,
    FormLabel,
    ListItem,
    Typography,
    makeStyles,
} from "@material-ui/core";
import { useSnackbar } from "notistack";
import { Request, RequestRepository } from "./Request";
import { useAuthState } from "../auth/AuthProvider";
import { Asset } from "../asset/Asset";
import AssetPicker from "../asset/AssetPicker";
import { minimize } from "../user/User";
import { usePagination } from "../../shared/pagination";
import { assetCollection, assetName, assetStatus } from "../../shared/const";
import { newId } from "../../shared/utils";
import { firestore } from "../../index";

const useStyles = makeStyles((theme) => ({
    textField: {
        margin: '0.6em 0',
        width: '100%',
        '& .MuiListItem-root': {
            borderRadius: theme.spacing(1)
        }
    }
}));

type RequestEditorProps = {
    isOpen: boolean,
    isCreate: boolean,
    request?: Request | undefined,
    onDismiss: () => void
}

const RequestEditor = (props: RequestEditorProps) => {
    const { t } = useTranslation();
    const classes = useStyles();
    const { enqueueSnackbar } = useSnackbar();
    const [asset, setAsset] = useState<Asset | undefined>(undefined);
    const [isPickerOpen, setPickerOpen] = useState<boolean>(false);
    const [isWritePending, setWritePending] = useState<boolean>(false);
    const { user } = useAuthState();

    const onSubmit = () => {
        if (asset !== undefined && user !== undefined) {
            setWritePending(true);
            const request: Request = {
                requestId: props.request !== undefined ? props.request?.requestId : newId(),
                asset: asset,
                petitioner: minimize(user) 
            }

            if (props.isCreate) {
                RequestRepository.create(request)
                    .then(() => enqueueSnackbar(t("feedback.request_created")))
                    .catch(() => enqueueSnackbar(t("feedback.request_create_error")))
                    .finally(() => {
                        setWritePending(false);
                        props.onDismiss();
                    })
            } else {
                RequestRepository.update(request)
                    .then(() => enqueueSnackbar(t("feedback.request_updated")))
                    .catch(() => enqueueSnackbar(t("feedback.request_update_error")))
                    .finally(() => {
                        setWritePending(false);
                        props.onDismiss();
                    })
            }
        }
    }

    const onPickerView = () => setPickerOpen(true);
    const onPickerDismiss = () => setPickerOpen(false);

    const { items, isLoading, isStart, isEnd, getPrev, getNext } = usePagination<Asset>(
        firestore.collection(assetCollection)
            .where(assetStatus, "!=", "OPERATIONAL")
            .orderBy(assetStatus, "asc")
            .orderBy(assetName, "asc"), { limit: 15 }
    )

    return (
        <> 
            <Dialog
                fullWidth={true}
                maxWidth="xs"
                open={props.isOpen}
                onClose={props.onDismiss}>
                <DialogTitle>{t("request_details")}</DialogTitle>
                <DialogContent>
                    <Container disableGutters>
                        <FormControl component="fieldset" className={classes.textField}>
                            <FormLabel component="legend">
                                <Typography variant="body2">{t("field.asset")}</Typography>
                            </FormLabel>
                            <ListItem button onClick={onPickerView} disabled={isWritePending}>
                                <Typography variant="body2">
                                    { asset !== undefined ? asset.assetName : t("not_set") }
                                </Typography>
                            </ListItem>
                        </FormControl>
                    </Container>
                </DialogContent>
                <DialogActions>
                    <Button
                        color="primary"
                        onClick={props.onDismiss}>
                        { t("button.cancel") }
                    </Button>
                    <Button
                        color="primary"
                        onClick={onSubmit}>
                        { t("button.save") }
                    </Button>
                </DialogActions>
            </Dialog>
            <AssetPicker
                isOpen={isPickerOpen}
                assets={items}
                isLoading={isLoading}
                hasPrevious={isStart}
                hasNext={isEnd}
                onPrevious={getPrev}
                onNext={getNext}
                onDismiss={onPickerDismiss}
                onSelectItem={setAsset}/>
        </>
    )
}

export default RequestEditor;