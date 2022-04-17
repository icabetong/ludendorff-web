import { StockCard, StockCardEntry, StockCardRepository } from "./StockCard";
import { useTranslation } from "react-i18next";
import { useForm, Controller } from "react-hook-form";
import { useEffect, useReducer, useState } from "react";
import { Asset } from "../asset/Asset";
import { usePagination } from "use-pagination-firestore";
import { collection, orderBy, query } from "firebase/firestore";
import { assetCollection, assetStockNumber } from "../../shared/const";
import { firestore } from "../../index";
import {
  Box,
  Button,
  Dialog,
  Divider,
  FormLabel,
  Grid,
  IconButton,
  InputAdornment,
  List,
  TextField,
  Typography,
  useMediaQuery,
  useTheme
} from "@mui/material";
import StockCardEntryList from "./StockCardEntryList";
import { AddRounded, ExpandMoreRounded } from "@mui/icons-material";
import { ActionType, initialState, reducer } from "./StockCardEntryEditorReducer";
import { StockCardEntryEditor } from "./StockCardEntryEditor";
import AssetPicker from "../asset/AssetPicker";
import { isDev, newId } from "../../shared/utils";
import { useSnackbar } from "notistack";
import { GridSelectionModel } from "@mui/x-data-grid";
import { EditorAppBar, EditorContent, EditorRoot, Transition } from "../../components/EditorComponent";
import StockCardEntryDataGrid from "./StockCardEntryDataGrid";

export type FormValues = {
  entityName?: string,
}

type StockCardEditorProps = {
  isOpen: boolean,
  isCreate: boolean,
  stockCard?: StockCard
  onDismiss: () => void,
}

export const StockCardEditor = (props: StockCardEditorProps) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const smBreakpoint = useMediaQuery(theme.breakpoints.down('sm'));
  const { handleSubmit, formState: { errors }, setValue, control } = useForm<FormValues>();
  const [asset, setAsset] = useState<Asset | null>(null);
  const [isOpen, setOpen] = useState(false);
  const [entries, setEntries] = useState<StockCardEntry[]>([]);
  const [state, dispatch] = useReducer(reducer, initialState);
  const [checked, setChecked] = useState<string[]>([]);
  const [isFetching, setFetching] = useState(false);
  const [isWriting, setWriting] = useState(false);
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    if (props.isOpen) {
      setValue("entityName", props.stockCard?.entityName)
    }
  }, [props.isOpen, props.stockCard, setValue])

  const onDismiss = () => {
    setWriting(false);
    props.onDismiss();
  }

  useEffect(() => {
    const fetchItems = async () => {
      if (props.stockCard) {
        const { stockCardId } = props.stockCard;

        return await StockCardRepository.fetch(stockCardId)
      } else return [];
    }

    setFetching(true);
    fetchItems()
      .then((arr) => setEntries(arr))
      .catch((error) => {
        if (isDev) console.log(error)
      })
      .finally(() => setFetching(false));
  }, [props.stockCard])

  const onEditorCreate = () => dispatch({ type: ActionType.CREATE });
  const onEditorDismiss = () => dispatch({ type: ActionType.DISMISS });
  const onEditorUpdate = (entry: StockCardEntry) => dispatch({ type: ActionType.UPDATE, payload: entry });
  const onEditorCommit = (entry: StockCardEntry) => {
    let currentEntries = Array.from(entries);
    let index = currentEntries.findIndex((i) => i.stockCardEntryId === entry.stockCardEntryId);
    if (index < 0) {
      currentEntries.push(entry);
    } else {
      currentEntries[index] = entry;
    }
    setEntries(currentEntries);
    onEditorDismiss();
  }

  const onPickerInvoke = () => setOpen(true);
  const onPickerDismiss = () => setOpen(false);

  const { items, isLoading, isStart, isEnd, getPrev, getNext } = usePagination<Asset>(
    query(collection(firestore, assetCollection), orderBy(assetStockNumber, "asc")), {
      limit: 15
    }
  )

  const onCheckedRowsChanged = (model: GridSelectionModel) => setChecked(model.map((id) => `${id}`))
  const onCheckedRowsRemove = () => {
    let currentEntries = Array.from(entries);
    checked.forEach((id: string) => {
      currentEntries = currentEntries.filter((i) => i.stockCardEntryId !== id);
    })
    setEntries(currentEntries);
  }

  const onSubmit = (values: FormValues) => {
    if (!asset && !props.stockCard) {
      return;
    }

    const stockCard: StockCard = {
      entityName: values.entityName,
      stockCardId: props.stockCard ? props.stockCard.stockCardId : newId(),
      stockNumber: props.stockCard ? props.stockCard.stockNumber : asset!.stockNumber,
      description: props.stockCard ? props.stockCard.description : asset!.description,
      unitOfMeasure: props.stockCard ? props.stockCard.unitOfMeasure : asset!.unitOfMeasure,
      unitPrice: props.stockCard ? props.stockCard.unitPrice : parseFloat(`${asset!.unitValue}`),
      entries: entries,
    }

    if (props.isCreate) {
      StockCardRepository.create(stockCard)
        .then(() => enqueueSnackbar(t("feedback.stock_card_created")))
        .catch((error) => {
          enqueueSnackbar(t("feedback.stock_card_create_error"))
          if (isDev) console.log(error)
        })
        .finally(props.onDismiss)
    } else {
      StockCardRepository.update(stockCard)
        .then(() => enqueueSnackbar(t("feedback.stock_card_updated")))
        .catch((error) => {
          enqueueSnackbar(t("feedback.stock_card_update_error"))
          if (isDev) console.log(error);
        })
        .finally(props.onDismiss)
    }
  }

  return (
    <>
      <Dialog
        open={props.isOpen}
        fullScreen={true}
        onClose={onDismiss}
        TransitionComponent={Transition}>
        <EditorRoot onSubmit={handleSubmit(onSubmit)}>
          <EditorAppBar
            title={t("dialog.details_stock_card")}
            loading={isWriting}
            onDismiss={onDismiss}/>
          <EditorContent>
            <Box>
              <Grid container direction={smBreakpoint ? "column" : "row"} alignItems="stretch" justifyContent="center"
                    spacing={smBreakpoint ? 0 : 4}>
                <Grid item xs={6} sx={{ maxWidth: "100%", pt: 0, pl: 0 }}>
                  <Controller
                    control={control}
                    name="entityName"
                    render={({ field: { ref, ...inputProps } }) => (
                      <TextField
                        {...inputProps}
                        autoFocus
                        type="text"
                        inputRef={ref}
                        label={t("field.entity_name")}
                        error={errors.entityName !== undefined}
                        helperText={errors.entityName?.message && t(errors.entityName?.message)}
                        disabled={isWriting}/>
                    )}
                    rules={{ required: { value: true, message: 'feedback.empty_entity_name' }}}/>
                </Grid>
                <Grid item xs={6} sx={{ maxWidth: "100%", pt: 0, pl: 0 }}>
                  <TextField
                    value={!props.stockCard ? asset?.description ? asset?.description : t("field.not_set") : props.stockCard.description }
                    label={t("field.asset")}
                    disabled={isWriting}
                    InputProps={{
                      readOnly: true,
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton onClick={onPickerInvoke} edge="end">
                            <ExpandMoreRounded/>
                          </IconButton>
                        </InputAdornment>
                      )
                    }}/>
                </Grid>
              </Grid>
            </Box>
            {!smBreakpoint && <Divider sx={{ my: 2 }}/>}
            <FormLabel component="legend">
              <Typography variant="body2">{t("field.entries")}</Typography>
            </FormLabel>
            {smBreakpoint
              ? <List>
                  <StockCardEntryList
                    entries={entries}
                    onItemSelected={onEditorUpdate}/>
                  <Button
                    fullWidth
                    startIcon={<AddRounded/>}
                    onClick={onEditorCreate}>
                    {t("add")}
                  </Button>
                </List>
              : <StockCardEntryDataGrid
                  entries={entries}
                  isLoading={isFetching}
                  onAddAction={onEditorCreate}
                  onRemoveAction={onCheckedRowsRemove}
                  onItemSelected={onEditorUpdate}
                  onCheckedRowsChanged={onCheckedRowsChanged}/>
            }
          </EditorContent>
        </EditorRoot>
      </Dialog>
      <AssetPicker
        isOpen={isOpen}
        assets={items}
        isLoading={isLoading}
        canBack={isStart}
        canForward={isEnd}
        onBackward={getPrev}
        onForward={getNext}
        onSelectItem={setAsset}
        onDismiss={onPickerDismiss}/>
      <StockCardEntryEditor
        isOpen={state.isOpen}
        isCreate={state.isCreate}
        entry={state.entry}
        onSubmit={onEditorCommit}
        onDismiss={onEditorDismiss}/>
    </>
  )
}