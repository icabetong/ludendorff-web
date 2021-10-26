import { useState, useReducer } from "react";
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
import { useSnackbar } from "notistack";
import { PlusIcon } from "@heroicons/react/outline";

import { Asset, Status, AssetRepository } from "./Asset";
import { Category, minimize } from "../category/Category";
import CategoryPicker from "../category/CategoryPicker";
import QrCodeViewComponent from "../qrcode/QrCodeViewComponent";
import { SpecificationEditor, FormValues as SpecFormValues } from "../specs/SpecificationEditor";
import { ActionType, initialState, reducer } from "../specs/SpecificationEditorReducer";
import SpecificationList from "../specs/SpecificationList";
import { usePagination } from "../../shared/pagination";
import { newId } from "../../shared/utils";
import { categoryCollection, categoryName } from "../../shared/const";
import { firestore } from "../../index";

const useStyles = makeStyles((theme) => ({
    textField: {
        width: '100%',
        margin: '0.6em 0',
        '& .MuiListItem-root': {
            borderRadius: theme.spacing(1)
        }
    },
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
    const [category, setCategory] = useState<Category | undefined>(undefined);
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

    const {
        items: categories,
        isLoading: isCategoriesLoading,
        isStart: atCategoryStart,
        isEnd: atCategoryEnd,
        getPrev: getPreviousCategories,
        getNext: getNextCategories
    } = usePagination<Category>(
        firestore
            .collection(categoryCollection)
            .orderBy(categoryName, "asc"), { limit: 15 }   
    );

    const onSubmit = (data: FormValues) => {
        const asset = {
            ...data,
            assetId: props.asset === undefined ? newId() : props.asset?.assetId,
            category: category !== undefined ? minimize(category) : undefined,
            specifications: specifications
        }
 
        if (props.isCreate) {
            AssetRepository.create(asset)
                .then(() => enqueueSnackbar(t("feedback.asset_created")))
                .catch(() => enqueueSnackbar(t("asset_create_error")))
                .finally(props.onDismiss)
        } else {
            AssetRepository.update(asset)
                .then(() => enqueueSnackbar(t("asset_updated")))
                .catch(() => enqueueSnackbar(t("asset_update_error")))
                .finally(props.onDismiss)
        }
    }

    const onSpecificationCommit = (specification: SpecFormValues) => {
        const specs = specifications;
        specs.set(specification.key, specification.value);
        setSpecifications(specs);

        onEditorDismiss();
    }

    const radioOperational = (
        <FormControlLabel 
            control={<Radio/>} 
            value={Status.OPERATIONAL} 
            label={ t("status.operational") } 
            disabled={props.asset?.status !== Status.OPERATIONAL}/>
    );
    const radioIdle = (
        <FormControlLabel 
            control={<Radio/>} 
            value={Status.IDLE} 
            label={ t("status.idle") }
            disabled={props.asset?.status === Status.OPERATIONAL}/>
    );
    const radioUnderMaintainance = (
        <FormControlLabel 
            control={<Radio/>} 
            value={Status.UNDER_MAINTENANCE} 
            label={ t("status.under_maintenance") }
            disabled={props.asset?.status === Status.OPERATIONAL}/>
    );
    const radioRetired = (
        <FormControlLabel 
            control={<Radio/>} 
            value={Status.RETIRED} 
            label={ t("status.retired") }
            disabled={props.asset?.status === Status.OPERATIONAL}/>
    );

    return (
        <>
            <Dialog
                fullScreen={isMobile}
                fullWidth={true}
                maxWidth={isMobile ? "xs" : "md" }
                open={props.isOpen}
                onClose={props.onDismiss}>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <DialogTitle>{ t("asset_details") }</DialogTitle>
                    <DialogContent dividers={true}>
                        <Container>
                            <Grid container direction={isMobile ? "column" : "row"} alignItems="stretch" justifyContent="center" spacing={isMobile ? 0 : 4}>
                                <Grid item xs={6} className={classes.gridItem}>
                                    <TextField
                                        autoFocus
                                        id="assetName"
                                        type="text"
                                        label={ t("field.asset_name") }
                                        error={errors.assetName !== undefined}
                                        helperText={errors.assetName?.message !== undefined ? t(errors.assetName.message) : undefined}
                                        defaultValue={props.asset !== undefined ? props.asset.assetName : ""}
                                        className={classes.textField}
                                        {...register("assetName", { required: "feedback.empty_asset_name" })}/>

                                    <FormControl component="fieldset" className={classes.textField}>
                                        <FormLabel component="legend">
                                            <Typography variant="body2">{ t("field.status") }</Typography>
                                        </FormLabel>
                                        <Controller
                                            name="status"
                                            control={control}
                                            defaultValue={props.asset !== undefined ? props.asset.status : Status.IDLE}
                                            render={({field: { onChange, value } }) => (
                                                <RadioGroup
                                                    aria-label={ t("field.status") } 
                                                    id="status" 
                                                    value={value}
                                                    onChange={onChange}>
                                                    { props.asset?.status !== Status.OPERATIONAL
                                                        ? <Tooltip title={<>{t("info.asset_should_have_assignment")}</>} placement="bottom-start">
                                                            <span>{radioOperational}</span>
                                                            </Tooltip>
                                                        : <>{radioOperational}</>
                                                    }
                                                    { props.asset?.status === Status.OPERATIONAL
                                                        ? <Tooltip title={<>{t("info.asset_has_assignment")}</>} placement="bottom-start">
                                                            <span>{radioIdle}</span>
                                                            </Tooltip>
                                                        : <>{radioIdle}</>
                                                    }
                                                    { props.asset?.status === Status.OPERATIONAL
                                                        ? <Tooltip title={<>{t("info.asset_has_assignment")}</>} placement="bottom-start">
                                                            <span>{radioUnderMaintainance}</span>
                                                            </Tooltip>
                                                        : <>{radioUnderMaintainance}</>
                                                    }
                                                    { props.asset?.status === Status.OPERATIONAL
                                                        ? <Tooltip title={<>{t("info.asset_has_assignment")}</>} placement="bottom-start">
                                                            <span>{radioRetired}</span>
                                                            </Tooltip>
                                                        : <>{radioRetired}</>
                                                    }
                                                </RadioGroup>
                                            )}/>
                                    </FormControl>

                                    <FormControl component="fieldset" className={classes.textField}>
                                        <FormLabel component="legend">
                                            <Typography variant="body2">{ t("field.category") }</Typography>
                                        </FormLabel>
                                        <ListItem button onClick={onPickerView}>
                                            <Typography variant="body2">
                                                { props.asset?.category?.categoryName !== undefined ? props.asset?.category?.categoryName : t("not_set")  }
                                            </Typography>
                                        </ListItem>
                                    </FormControl>
                                    
                                </Grid>
                                <Grid item xs={6} className={classes.gridItem}>
                                    <FormLabel component="legend">
                                        <Typography variant="body2">{ t("field.specification") }</Typography>
                                    </FormLabel>
                                    <List>
                                        <SpecificationList 
                                            specifications={specifications} 
                                            onItemSelected={onEditorUpdate}/>
                                        <Button
                                            className={classes.textField}
                                            startIcon={<PlusIcon className={classes.icon}/>}
                                            onClick={onEditorCreate}>
                                                { t("add") }
                                        </Button>
                                    </List>
                                </Grid>
                            </Grid>
                        </Container>
                    </DialogContent>

                    <DialogActions>
                        <Button color="primary" onClick={onQRCodeView} disabled={props.asset?.assetId === undefined}>{ t("view_qr_code")}</Button>
                        <div style={{flex: '1 0 0'}}></div>
                        <Button 
                            color="primary" 
                            onClick={props.onDismiss}>
                            { t("cancel") }
                        </Button>
                        <Button 
                            color="primary" 
                            type="submit">
                            { t("save") }
                        </Button>
                    </DialogActions>
                </form>
            </Dialog>
            {
                <SpecificationEditor
                    isOpen={state.isOpen} 
                    isCreate={state.isCreate}
                    specification={state.specification}
                    onSubmit={onSpecificationCommit}
                    onCancel={onEditorDismiss}/>
            }
            { isPickerOpen &&
                <CategoryPicker
                    isOpen={isPickerOpen}
                    categories={categories}
                    isLoading={isCategoriesLoading}
                    hasPrevious={atCategoryStart}
                    hasNext={atCategoryEnd}
                    onPreviousBatch={getPreviousCategories}
                    onNextBatch={getNextCategories}
                    onDismiss={onPickerDismiss}
                    onSelectItem={setCategory}/>
            }
            { isQRCodeOpen && props.asset !== undefined &&
                <QrCodeViewComponent
                    isOpened={isQRCodeOpen}
                    assetId={props.asset.assetId}
                    onClose={onQRCodeDismiss}/>
            }
        </>
    );
}

export default AssetEditor;