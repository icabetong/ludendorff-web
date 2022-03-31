import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import {
  Button,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormLabel,
  Grid,
  ListItem,
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { useSnackbar } from "notistack";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";

import { Asset, AssetRepository } from "./Asset";
import { Type, TypeCore, minimize } from "../type/Type";
import TypePicker from "../type/TypePicker";
import QrCodeViewComponent from "../qrcode/QrCodeViewComponent";
import { typeCollection, typeName } from "../../shared/const";
import { firestore } from "../../index";

type AssetEditorProps = {
  isOpen: boolean,
  isCreate: boolean,
  asset: Asset | undefined,
  onDismiss: () => void,
}

export type FormValues = {
  stockNumber: string,
  description: string,
  classification: string,
  unitOfMeasure: string,
  unitValue: number,
  remarks?: string,
}

const AssetEditor = (props: AssetEditorProps) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const { enqueueSnackbar } = useSnackbar();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>();
  const [isLoading, setLoading] = useState(true);
  const [types, setTypes] = useState<Type[]>([]);
  const [type, setType] = useState<TypeCore | undefined>(props.asset?.type);
  const [isPickerOpen, setPickerOpen] = useState(false);
  const [isQRCodeOpen, setQRCodeOpen] = useState(false);

  const onPickerView = () => setPickerOpen(true);
  const onPickerDismiss = () => setPickerOpen(false);

  const onQRCodeView = () => setQRCodeOpen(true);
  const onQRCodeDismiss = () => setQRCodeOpen(false);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    const unsubscribe = onSnapshot(query(collection(firestore, typeCollection), orderBy(typeName, "asc")), (snapshots) => {
      if (mounted) {
        setTypes(snapshots.docs.map((doc) => doc.data() as Type));
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
      unsubscribe();
    }
  }, [])

  let previousTypeId: string | undefined = undefined;
  const onSubmit = (data: FormValues) => {
    if (!data.stockNumber) {
      return;
    }

    const asset: Asset = {
      ...data,
      stockNumber: props.asset === undefined ? data.stockNumber : props.asset?.stockNumber,
      type: type !== undefined ? type : undefined,
    }

    if (props.isCreate) {
      AssetRepository.create(asset)
        .then(() => enqueueSnackbar(t("feedback.asset_created")))
        .catch((e) => enqueueSnackbar(t("feedback.asset_create_error")))
        .finally(props.onDismiss)
    } else {
      AssetRepository.update(asset, previousTypeId)
        .then(() => enqueueSnackbar(t("feedback.asset_updated")))
        .catch((e) => enqueueSnackbar(t("feedback.asset_update_error")))
        .finally(props.onDismiss)
    }
  }

  const onTypeChanged = (newType: Type) => {
    if (props.asset?.type !== undefined && props.asset?.type?.typeId !== newType.typeId)
      previousTypeId = props.asset?.type?.typeId;

    setType(minimize(newType));
    onPickerDismiss();
  }

  return (
    <>
      <Dialog
        fullScreen={isMobile}
        fullWidth={true}
        maxWidth={isMobile ? "xs" : "md"}
        open={props.isOpen}
        onClose={props.onDismiss}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogTitle>{t("asset_details")}</DialogTitle>
          <DialogContent dividers={true}>
            <Container>
              <Grid container direction={isMobile ? "column" : "row"} alignItems="stretch" justifyContent="center" spacing={isMobile ? 0 : 4}>
                <Grid item xs={6} sx={{maxWidth: '100%', pt: 0, pl: 0}}>
                  <TextField
                    autoFocus
                    id="stockNumber"
                    type="text"
                    label={t("field.stock_number")}
                    error={errors.stockNumber !== undefined}
                    helperText={errors.stockNumber?.message !== undefined ? t(errors.stockNumber.message) : undefined}
                    defaultValue={props.asset && props.asset.stockNumber}
                    placeholder={t('placeholder.stock_number')}
                      {...register("stockNumber",{ required: "feedback.empty_asset_stock_number"}) }/>
                  <TextField
                    id="description"
                    type="text"
                    label={t("field.asset_description")}
                    error={errors.description !== undefined}
                    helperText={errors.description?.message !== undefined ? t(errors.description.message) : undefined}
                    defaultValue={props.asset !== undefined ? props.asset.description : ""}
                    placeholder={t('placeholder.asset_description')}
                      {...register("description", { required: "feedback.empty_asset_name" })} />
                  <FormControl component="fieldset" fullWidth>
                    <FormLabel component="legend">
                      <Typography variant="body2">{t("field.type")}</Typography>
                    </FormLabel>
                    <ListItem button onClick={onPickerView}>
                      <Typography variant="body2">
                        {type?.typeName !== undefined ? type?.typeName : t("not_set")}
                      </Typography>
                    </ListItem>
                  </FormControl>
                  <TextField
                    id="classification"
                    type="text"
                    label={t("field.classification")}
                    error={errors.classification !== undefined}
                    helperText={errors.classification?.message !== undefined ? t(errors.classification.message) : undefined}
                    defaultValue={props.asset && props.asset.classification}
                    placeholder={t('placeholder.classification')}
                    {...register('classification', { required: "feedback.empty_classification" })}/>
                </Grid>
                <Grid item xs={6} sx={{maxWidth: '100%', pt: 0, pl: 0}}>
                  <TextField
                    id="unitOfMeasure"
                    type="text"
                    label={t("field.unit_of_measure")}
                    error={errors.unitOfMeasure !== undefined}
                    helperText={errors.unitOfMeasure?.message !== undefined ? t(errors.unitOfMeasure.message) : undefined}
                    defaultValue={props.asset && props.asset.unitOfMeasure}
                    placeholder={t('placeholder.unit_of_measure')}
                    {...register('unitOfMeasure', { required: 'feedback.empty_unit_of_measure'})}/>
                  <TextField
                    id="unitValue"
                    type="number"
                    label={t("field.unit_value")}
                    error={errors.unitValue !== undefined}
                    helperText={errors.unitValue?.message !== undefined ? t(errors.unitValue.message) : undefined}
                    defaultValue={props.asset && props.asset.unitValue}
                    placeholder={t('placeholder.unit_value')}
                    {...register('unitValue', { required: 'feedback.empty_unit_value'})}/>
                  <TextField
                    id='remarks'
                    type="text"
                    multiline
                    rows={4}
                    label={t('field.remarks')}
                    defaultValue={props.asset && props.asset.remarks}
                    {...register('remarks', { required: 'feedback.empty_asset_remarks'})}/>
                </Grid>
              </Grid>
            </Container>
          </DialogContent>

          <DialogActions>
            <Button color="primary" onClick={onQRCodeView} disabled={props.asset?.stockNumber === undefined}>{t("view_qr_code")}</Button>
            <div style={{ flex: '1 0 0' }}></div>
            <Button
              color="primary"
              onClick={props.onDismiss}>
              {t("cancel")}
            </Button>
            <Button
              color="primary"
              type="submit">
              {t("save")}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
      {isPickerOpen &&
        <TypePicker
          isOpen={isPickerOpen}
          types={types}
          isLoading={isLoading}
          onDismiss={onPickerDismiss}
          onSelectItem={onTypeChanged} />
      }
      {isQRCodeOpen && props.asset !== undefined &&
        <QrCodeViewComponent
          isOpened={isQRCodeOpen}
          assetId={props.asset.stockNumber}
          onClose={onQRCodeDismiss} />
      }
    </>
  );
}

export default AssetEditor;