import { useEffect, useState } from "react";
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
  Typography
} from "@material-ui/core";
import { useSnackbar } from "notistack";
import { query, collection, orderBy, where, onSnapshot, Timestamp } from "firebase/firestore";
import { Request, RequestRepository } from "./Request";
import { useAuthState } from "../auth/AuthProvider";
import { Asset } from "../asset/Asset";
import AssetPicker from "../asset/AssetPicker";
import { minimize } from "../user/User";
import { assetCollection, assetName, assetStatus } from "../../shared/const";
import { newId } from "../../shared/utils";
import { firestore } from "../../index";

type RequestEditorProps = {
  isOpen: boolean,
  isCreate: boolean,
  request?: Request | undefined,
  onDismiss: () => void
}

const RequestEditor = (props: RequestEditorProps) => {
  const { t } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();
  const [asset, setAsset] = useState<Asset | undefined>(undefined);
  const [isPickerOpen, setPickerOpen] = useState<boolean>(false);
  const [isWritePending, setWritePending] = useState<boolean>(false);
  const [isLoading, setLoading] = useState(true);
  const [assets, setAssets] = useState<Asset[]>([]);
  const { user } = useAuthState();

  const onSubmit = () => {
    if (asset !== undefined && user !== undefined) {
      setWritePending(true);
      const request: Request = {
        requestId: props.request !== undefined ? props.request?.requestId : newId(),
        asset: asset,
        petitioner: minimize(user),
        submittedTimestamp: props.request !== undefined ? props.request?.submittedTimestamp : Timestamp.now()
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

  useEffect(() => {
    let mounted = true;
    const unsubscribe = onSnapshot(query(collection(firestore, assetCollection), 
    where(assetStatus, '!=', "OPERATIONAL"),
    orderBy(assetStatus, "asc"),
    orderBy(assetName, "asc")), (snapshot) => {
      if (mounted) {
        setAssets(snapshot.docs.map((doc) => doc.data() as Asset));
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
      unsubscribe();
    }
  }, []);

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
            <FormControl component="fieldset" fullWidth>
              <FormLabel component="legend">
                <Typography variant="body2">{t("field.asset")}</Typography>
              </FormLabel>
              <ListItem button onClick={onPickerView} disabled={isWritePending}>
                <Typography variant="body2">
                  {asset !== undefined ? asset.assetName : t("not_set")}
                </Typography>
              </ListItem>
            </FormControl>
          </Container>
        </DialogContent>
        <DialogActions>
          <Button
            color="primary"
            onClick={props.onDismiss}>
            {t("button.cancel")}
          </Button>
          <Button
            color="primary"
            onClick={onSubmit}>
            {t("button.save")}
          </Button>
        </DialogActions>
      </Dialog>
      <AssetPicker
        isOpen={isPickerOpen}
        assets={assets}
        isLoading={isLoading}
        onDismiss={onPickerDismiss}
        onSelectItem={setAsset} />
    </>
  )
}

export default RequestEditor;