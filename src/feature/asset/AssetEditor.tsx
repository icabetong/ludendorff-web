import { useEffect, useState, useReducer } from "react";
import { useTranslation } from "react-i18next";
import { Controller, useForm } from "react-hook-form";
import {
  Button,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  FormLabel,
  Grid,
  List,
  ListItem,
  Radio,
  RadioGroup,
  TextField,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
  makeStyles
} from "@material-ui/core";
import { AddRounded } from "@material-ui/icons";
import { useSnackbar } from "notistack";
import { collection, query, orderBy, onSnapshot, Timestamp } from "firebase/firestore";

import { Asset, Status, AssetRepository } from "./Asset";
import { Type, TypeCore, minimize } from "../type/Type";
import TypePicker from "../type/TypePicker";
import QrCodeViewComponent from "../qrcode/QrCodeViewComponent";
import { SpecificationEditor, FormValues as SpecFormValues } from "../specs/SpecificationEditor";
import { ActionType, initialState, reducer } from "../specs/SpecificationEditorReducer";
import SpecificationList from "../specs/SpecificationList";
import { newId } from "../../shared/utils";
import { typeCollection, typeName } from "../../shared/const";
import { firestore } from "../../index";

const useStyles = makeStyles((theme) => ({
  icon: {
    width: '1em',
    height: '1em',
    color: theme.palette.text.primary
  },
  gridItem: {
    maxWidth: '100%'
  }
}));

type AssetEditorProps = {
  isOpen: boolean,
  isCreate: boolean,
  asset: Asset | undefined,
  onDismiss: () => void,
}

export type FormValues = {
  assetName: string,
  status: Status,
}

const AssetEditor = (props: AssetEditorProps) => {
  const { t } = useTranslation();
  const classes = useStyles();
  const theme = useTheme();
  const { enqueueSnackbar } = useSnackbar();
  const isMobile = useMediaQuery(theme.breakpoints.down('xs'));
  const { register, handleSubmit, formState: { errors }, control } = useForm<FormValues>();
  const [isLoading, setLoading] = useState(true);
  const [categories, setCategories] = useState<Type[]>([]);
  const [category, setCategory] = useState<TypeCore | undefined>(props.asset?.type);
  const [specifications, setSpecifications] = useState<Map<string, string>>(props.asset?.specifications !== undefined ? new Map(Object.entries(props.asset?.specifications)) : new Map());
  const [isPickerOpen, setPickerOpen] = useState(false);
  const [isQRCodeOpen, setQRCodeOpen] = useState(false);
  const [state, dispatch] = useReducer(reducer, initialState)

  const onPickerView = () => setPickerOpen(true);
  const onPickerDismiss = () => setPickerOpen(false);

  const onQRCodeView = () => setQRCodeOpen(true);
  const onQRCodeDismiss = () => setQRCodeOpen(false);

  const onEditorCreate = () => dispatch({ type: ActionType.CREATE })
  const onEditorDismiss = () => dispatch({ type: ActionType.DISMISS })
  const onEditorUpdate = (specification: [string, string]) => dispatch({
    type: ActionType.UPDATE,
    payload: specification
  })

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    const unsubscribe = onSnapshot(query(collection(firestore, typeCollection), orderBy(typeName, "asc")), (snapshots) => {
      if (mounted) {
        setCategories(snapshots.docs.map((doc) => doc.data() as Type));
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
      unsubscribe();
    }
  }, [])

  let previousCategoryId: string | undefined = undefined;
  const onSubmit = (data: FormValues) => {
    const asset: Asset = {
      ...data,
      stockNumber: props.asset === undefined ? newId() : props.asset?.stockNumber,
      type: category !== undefined ? category : undefined,
      specifications: Object.fromEntries(specifications),
      dateCreated: Timestamp.now()
    }

    if (props.isCreate) {
      AssetRepository.create(asset)
        .then(() => enqueueSnackbar(t("feedback.asset_created")))
        .catch(() => enqueueSnackbar(t("feedback.asset_create_error")))
        .finally(props.onDismiss)
    } else {
      AssetRepository.update(asset, previousCategoryId)
        .then(() => enqueueSnackbar(t("feedback.asset_updated")))
        .catch(() => enqueueSnackbar(t("feedback.asset_update_error")))
        .finally(props.onDismiss)
    }
  }

  const onCategoryChanged = (newCategory: Type) => {
    if (props.asset?.type !== undefined && props.asset?.type?.typeId !== newCategory.typeId)
      previousCategoryId = props.asset?.type?.typeId;

    setCategory(minimize(newCategory));
    onPickerDismiss();
  }

  const onSpecificationCommit = (specification: SpecFormValues) => {
    const specs = specifications;
    specs.set(specification.key, specification.value);
    setSpecifications(specs);

    onEditorDismiss();
  }

  const radioOperational = (
    <FormControlLabel
      control={<Radio />}
      value={Status.OPERATIONAL}
      label={t("status.operational")}
      disabled={props.asset?.status !== Status.OPERATIONAL} />
  );
  const radioIdle = (
    <FormControlLabel
      control={<Radio />}
      value={Status.IDLE}
      label={t("status.idle")}
      disabled={props.asset?.status === Status.OPERATIONAL} />
  );
  const radioUnderMaintainance = (
    <FormControlLabel
      control={<Radio />}
      value={Status.UNDER_MAINTENANCE}
      label={t("status.under_maintenance")}
      disabled={props.asset?.status === Status.OPERATIONAL} />
  );
  const radioRetired = (
    <FormControlLabel
      control={<Radio />}
      value={Status.RETIRED}
      label={t("status.retired")}
      disabled={props.asset?.status === Status.OPERATIONAL} />
  );

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
                <Grid item xs={6} className={classes.gridItem}>
                  <TextField
                    autoFocus
                    id="assetName"
                    type="text"
                    label={t("field.asset_name")}
                    error={errors.assetName !== undefined}
                    helperText={errors.assetName?.message !== undefined ? t(errors.assetName.message) : undefined}
                    defaultValue={props.asset !== undefined ? props.asset.description : ""}
                    {...register("assetName", { required: "feedback.empty_asset_name" })} />

                  <FormControl component="fieldset" fullWidth>
                    <FormLabel component="legend">
                      <Typography variant="body2">{t("field.status")}</Typography>
                    </FormLabel>
                    <Controller
                      name="status"
                      control={control}
                      defaultValue={props.asset !== undefined ? props.asset.status : Status.IDLE}
                      render={({ field: { onChange, value } }) => (
                        <RadioGroup
                          aria-label={t("field.status")}
                          id="status"
                          value={value}
                          onChange={onChange}>
                          {props.asset?.status !== Status.OPERATIONAL
                            ? <Tooltip title={<>{t("info.asset_should_have_assignment")}</>} placement="bottom-start">
                              <span>{radioOperational}</span>
                            </Tooltip>
                            : <>{radioOperational}</>
                          }
                          {props.asset?.status === Status.OPERATIONAL
                            ? <Tooltip title={<>{t("info.asset_has_assignment")}</>} placement="bottom-start">
                              <span>{radioIdle}</span>
                            </Tooltip>
                            : <>{radioIdle}</>
                          }
                          {props.asset?.status === Status.OPERATIONAL
                            ? <Tooltip title={<>{t("info.asset_has_assignment")}</>} placement="bottom-start">
                              <span>{radioUnderMaintainance}</span>
                            </Tooltip>
                            : <>{radioUnderMaintainance}</>
                          }
                          {props.asset?.status === Status.OPERATIONAL
                            ? <Tooltip title={<>{t("info.asset_has_assignment")}</>} placement="bottom-start">
                              <span>{radioRetired}</span>
                            </Tooltip>
                            : <>{radioRetired}</>
                          }
                        </RadioGroup>
                      )} />
                  </FormControl>

                  <FormControl component="fieldset" fullWidth>
                    <FormLabel component="legend">
                      <Typography variant="body2">{t("field.category")}</Typography>
                    </FormLabel>
                    <ListItem button onClick={onPickerView}>
                      <Typography variant="body2">
                        {category?.typeName !== undefined ? category?.typeName : t("not_set")}
                      </Typography>
                    </ListItem>
                  </FormControl>

                </Grid>
                <Grid item xs={6} className={classes.gridItem}>
                  <FormLabel component="legend">
                    <Typography variant="body2">{t("field.specification")}</Typography>
                  </FormLabel>
                  <List>
                    <SpecificationList
                      specifications={specifications}
                      onItemSelected={onEditorUpdate} />
                    <Button
                      fullWidth
                      startIcon={<AddRounded/>}
                      onClick={onEditorCreate}>
                      {t("add")}
                    </Button>
                  </List>
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
      {state.isOpen &&
        <SpecificationEditor
          isOpen={state.isOpen}
          isCreate={state.isCreate}
          specification={state.specification}
          onSubmit={onSpecificationCommit}
          onCancel={onEditorDismiss} />
      }
      {isPickerOpen &&
        <TypePicker
          isOpen={isPickerOpen}
          types={categories}
          isLoading={isLoading}
          onDismiss={onPickerDismiss}
          onSelectItem={onCategoryChanged} />
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