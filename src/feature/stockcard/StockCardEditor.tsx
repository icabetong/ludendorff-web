import { useEffect, useReducer, useState } from "react";
import { useTranslation } from "react-i18next";
import { Controller, useForm } from "react-hook-form";
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
import { GridSelectionModel } from "@mui/x-data-grid";
import { AddRounded, ArrowDropDown } from "@mui/icons-material";
import { useSnackbar } from "notistack";
import { collection, getDocs, query, where } from "firebase/firestore";
import { StockCard, StockCardEntry, StockCardRepository } from "./StockCard";
import { StockCardEntryEditor } from "./StockCardEntryEditor";
import { initialState, reducer } from "./StockCardEntryEditorReducer";
import StockCardEntryDataGrid from "./StockCardEntryDataGrid";
import StockCardEntryList from "./StockCardEntryList";
import InventoryReportPicker from "../inventory/InventoryReportPicker";
import { InventoryReport, InventoryReportItem } from "../inventory/InventoryReport";
import IssuedReportItemPicker from "../issue/IssuedReportItemPicker";
import { IssuedReportItem } from "../issue/IssuedReport";
import { Balances } from "../shared/types/Balances";
import { EditorAppBar, EditorContent, EditorRoot, SlideUpTransition, useDialog } from "../../components";
import { assetStockNumber, inventoryCollection, inventoryItems } from "../../shared/const";
import { isDev, newId } from "../../shared/utils";
import { firestore } from "../../index";

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
  const [stockCard, setStockCard] = useState<StockCard | undefined>(props.stockCard);
  const [isOpen, setOpen] = useState(false);
  const [entries, setEntries] = useState<StockCardEntry[]>([]);
  const [entry, setEntry] = useState<StockCardEntry | null>(null);
  const [state, dispatch] = useReducer(reducer, initialState);
  const [checked, setChecked] = useState<string[]>([]);
  const [isFetching, setFetching] = useState(false);
  const [isWriting, setWriting] = useState(false);
  const [balances, setBalances] = useState<Balances>({  });
  const [totalIssued, setTotalIssued] = useState<number>(0);
  const { enqueueSnackbar } = useSnackbar();
  const show = useDialog();

  useEffect(() => {
    if (props.isOpen) {
      setValue("entityName", props.stockCard ? props.stockCard?.entityName : "");
      if (props.stockCard?.balances) {
        setBalances(props.stockCard?.balances)
      }
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
  }, [props.stockCard]);

  const onEditorCreate = () => dispatch({ type: "create" });
  const onEditorDismiss = () => dispatch({ type: "dismiss" });
  const onEditorUpdate = (entry: StockCardEntry) => dispatch({ type: "update", payload: entry });
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

  const onInventoryPickerInvoke = (entry: StockCardEntry) => setEntry(entry);
  const onInventoryPickerDismiss = () => setEntry(null);

  const onCheckedRowsChanged = (model: GridSelectionModel) => setChecked(model.map((id) => `${id}`))
  const onCheckedRowsRemove = () => {
    let currentEntries = Array.from(entries);
    checked.forEach((id: string) => {
      currentEntries = currentEntries.filter((i) => i.stockCardEntryId !== id);
    })
    setEntries(currentEntries);
  }

  const onSubmit = (values: FormValues) => {
    if (!stockCard && !props.stockCard) {
      return;
    }

    const card: StockCard = {
      ...stockCard,
      stockCardId: props.stockCard ? props.stockCard.stockCardId : newId(),
      unitPrice: props.stockCard ? props.stockCard.unitPrice : 0,
      entityName: values.entityName,
      balances: balances,
      entries: entries
    }

    if (props.isCreate) {
      StockCardRepository.create(card)
        .then(() => enqueueSnackbar(t("feedback.stock_card_created")))
        .catch((error) => {
          enqueueSnackbar(t("feedback.stock_card_create_error"))
          if (isDev) console.log(error)
        })
        .finally(props.onDismiss)
    } else {
      StockCardRepository.update(card)
        .then(() => enqueueSnackbar(t("feedback.stock_card_updated")))
        .catch((error) => {
          enqueueSnackbar(t("feedback.stock_card_update_error"))
          if (isDev) console.log(error);
        })
        .finally(props.onDismiss)
    }
  }

  const onQuantitySourceSelected = async (report: InventoryReport) => {
    if (stockCard === null)
      return;
    if (entry === null)
      return;

    // Find the source for the onHandCount (quantity) in the selected
    // Physical Reports of Inventories record.
    let collectionQuery = query(collection(firestore, inventoryCollection,
      report.inventoryReportId, inventoryItems), where(assetStockNumber, "==", stockCard!.stockNumber));
    let snapshot = await getDocs(collectionQuery);
    let items = snapshot.docs.map((doc) => doc.data() as InventoryReportItem)
    if (items.length > 0) {
      let inventoryReportItem: InventoryReportItem = items[0];
      if (inventoryReportItem.onHandCount < entry.issueQuantity) {
        await show({
          title: t("dialog.issued_is_more_than_current"),
          description: t("dialog.issued_is_more_than_current_summary"),
          dismissButtonText: t("button.cancel")
        });
        return;
      }

      // Locate the position of the entry that will be
      // updated with the new received quantity data
      let index = entries.findIndex((e) => e.stockCardEntryId === entry.stockCardEntryId);
      let currentEntries = Array.from(entries);
      if (index >= 0) {
        // Get the current values of the balances from the state and the
        // appropriate entry from it using the report's inventoryReportId
        let currentBalances = balances;
        let currentEntry = currentBalances[report.inventoryReportId];
        if (currentEntry) {
          // If the balance exists for the said inventoryReportId,
          // subtract the remaining quantities of the asset using the issueQuantity
          // of the entry; Then merge the entries so that other stock card entry
          // records will not be lost. Don't forget to subtract the remaining quantities
          // and the issueQuantity again.
          currentBalances[report.inventoryReportId] = {
            remaining: currentEntry.remaining - entry.issueQuantity,
            entries: {
              ...currentEntry.entries,
              [`${entry.stockCardEntryId}`]: currentEntry.remaining - entry.issueQuantity,
            }
          }

          // Update the stock card entry for the new receive quantity and the new source id
          currentEntries[index] = {
            ...entry,
            receivedQuantity: currentEntry.remaining,
            inventoryReportSourceId: report.inventoryReportId
          };
          setEntries(currentEntries);
          setEntry(null);
        } else {
          // Create a new record and subtract the onHandCount values of the report as this entry
          // is the first to use it as the source, do the same of the entry
          currentBalances[report.inventoryReportId] = {
            entries: {
              [`${entry.stockCardEntryId}`]: inventoryReportItem.onHandCount - entry.issueQuantity,
            },
            remaining: inventoryReportItem.onHandCount - entry.issueQuantity,
          };
          currentEntries[index] = {
            ...entry,
            receivedQuantity: inventoryReportItem.onHandCount,
            inventoryReportSourceId: report.inventoryReportId
          };
          setEntries(currentEntries);
          setEntry(null);
        }
        setBalances(currentBalances);
      }
    } else {
      await show({
        title: t("dialog.stock_number_not_found_on_report"),
        description: t("dialog.stock_number_not_found_on_report_summary"),
        dismissButtonText: t("button.cancel")
      });
      return;
    }
    onInventoryPickerDismiss();
  }

  const onParseData = (items: IssuedReportItem[]) => {
    if (items.length > 0) {
      let issuedReportItem = items[0];
      let stockCard: StockCard = {
        stockCardId: props.stockCard ? props.stockCard.stockCardId : newId(),
        stockNumber: issuedReportItem.stockNumber,
        description: issuedReportItem.description,
        unitPrice: issuedReportItem.unitCost,
        unitOfMeasure: issuedReportItem.unitOfMeasure,
        balances: {},
        entries: []
      }
      setStockCard(stockCard);

      let total = 0;
      let arr: StockCardEntry[] = [];
      items.forEach((issuedItem) => {
        let entry: StockCardEntry = {
          stockCardEntryId: newId(),
          receivedQuantity: 0,
          requestedQuantity: 0,
          issueQuantity: issuedItem.quantityIssued,
          issueOffice: issuedItem.responsibilityCenter
        }
        arr.push(entry);
        total += entry.issueQuantity;
      });

      setTotalIssued(total);
      setEntries(arr);
    }
  }

  return (
    <>
      <Dialog
        open={props.isOpen}
        fullScreen={true}
        onClose={onDismiss}
        TransitionComponent={SlideUpTransition}>
        <EditorRoot onSubmit={handleSubmit(onSubmit)}>
          <EditorAppBar
            title={t("dialog.details_stock_card")}
            loading={isWriting}
            onDismiss={onDismiss}/>
          <EditorContent>
            <Box>
              <Grid
                container
                direction={smBreakpoint ? "column" : "row"}
                alignItems="stretch"
                justifyContent="center"
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
                  <TextField
                    value={totalIssued}
                    label={t("field.total_issued_quantity")}
                    disabled={isWriting}
                    InputProps={{
                      readOnly: true,
                    }}/>
                </Grid>
                <Grid item xs={6} sx={{ maxWidth: "100%", pt: 0, pl: 0 }}>
                  <TextField
                    value={stockCard?.description ? stockCard?.description : t("field.not_set")}
                    label={t("field.asset")}
                    disabled={isWriting}
                    InputProps={{
                      readOnly: true,
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton onClick={onPickerInvoke} edge="end">
                            <ArrowDropDown/>
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
                  balances={balances}
                  stockCard={stockCard}
                  isLoading={isFetching}
                  onAddAction={onEditorCreate}
                  onRemoveAction={onCheckedRowsRemove}
                  onItemSelected={onEditorUpdate}
                  onSourceSelect={onInventoryPickerInvoke}
                  onCheckedRowsChanged={onCheckedRowsChanged}/>
            }
          </EditorContent>
        </EditorRoot>
      </Dialog>
      <IssuedReportItemPicker
        isOpen={isOpen}
        onItemSelected={onParseData}
        onDismiss={onPickerDismiss}/>
      <InventoryReportPicker
        isOpen={Boolean(entry)}
        stockNumber={stockCard && stockCard.stockNumber}
        onItemSelected={onQuantitySourceSelected}
        onDismiss={onInventoryPickerDismiss}/>
      <StockCardEntryEditor
        isOpen={state.isOpen}
        isCreate={state.isCreate}
        entry={state.entry}
        balances={balances}
        stockCard={stockCard}
        onSubmit={onEditorCommit}
        onDismiss={onEditorDismiss} />
    </>
  )
}