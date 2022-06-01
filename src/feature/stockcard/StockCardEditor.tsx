import { useEffect, useReducer, useState } from "react";
import { useTranslation } from "react-i18next";
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
import { useEntity } from "../entity/UseEntity";
import InventoryReportPicker from "../inventory/InventoryReportPicker";
import { InventoryReport, InventoryReportItem } from "../inventory/InventoryReport";
import IssuedReportItemPicker from "../issue/IssuedReportItemPicker";
import { IssuedReportItem } from "../issue/IssuedReport";
import { Balances } from "../shared/types/Balances";
import { useDialog } from "../../components/dialog/DialogProvider";
import { EditorAppBar } from "../../components/editor/EditorAppBar";
import { EditorContent } from "../../components/editor/EditorContent";
import { EditorRoot } from "../../components/editor/EditorRoot";
import { SlideUpTransition } from "../../components/transition/SlideUpTransition";
import { assetStockNumber, inventoryCollection, inventoryItems } from "../../shared/const";
import { isDev, newId } from "../../shared/utils";
import { firestore } from "../../index";
import { useAuthState } from "../auth/AuthProvider";

type StockCardEditorProps = {
  isOpen: boolean,
  isCreate: boolean,
  stockCard?: StockCard
  onDismiss: () => void,
}

export const StockCardEditor = (props: StockCardEditorProps) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const { user } = useAuthState();
  const smBreakpoint = useMediaQuery(theme.breakpoints.down('sm'));
  const [stockCard, setStockCard] = useState<StockCard | undefined>(props.stockCard);
  const [isOpen, setOpen] = useState(false);
  const [reportPickerOpen, setReportPickerOpen] = useState(false);
  const [entries, setEntries] = useState<StockCardEntry[]>([]);
  const [state, dispatch] = useReducer(reducer, initialState);
  const [checked, setChecked] = useState<string[]>([]);
  const [isFetching, setFetching] = useState(false);
  const [isWriting, setWriting] = useState(false);
  const [sourceReport, setSourceReport] = useState<InventoryReport | undefined>(undefined);
  const [balances, setBalances] = useState<Balances>({  });
  const [totalIssued, setTotalIssued] = useState<number>(0);
  const { entity } = useEntity();
  const { enqueueSnackbar } = useSnackbar();
  const show = useDialog();

  useEffect(() => {
    if (props.isOpen && props.stockCard?.balances) {
      setBalances(props.stockCard?.balances);
    }
  }, [props.isOpen, props.stockCard])

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

  const onInventoryPickerInvoke = () => setReportPickerOpen(true);
  const onInventoryPickerDismiss = () => setReportPickerOpen(false);

  const onCheckedRowsChanged = (model: GridSelectionModel) => setChecked(model.map((id) => `${id}`))
  const onCheckedRowsRemove = () => {
    let currentEntries = Array.from(entries);
    checked.forEach((id: string) => {
      currentEntries = currentEntries.filter((i) => i.stockCardEntryId !== id);
    })
    setEntries(currentEntries);
  }

  const onSubmit = async () => {
    if (entries.some((entry) => !entry.date || !entry.reference)) {
      let result = await show({
        title: t("dialog.data_missing"),
        description: t("dialog.data_missing_summary"),
        confirmButtonText: t("button.continue"),
        dismissButtonText: t("button.cancel")
      });
      if (!result) return;
    }

    if (!user) return;

    if (!stockCard && !props.stockCard) {
      return;
    }

    const card: StockCard = {
      ...stockCard,
      stockCardId: props.stockCard ? props.stockCard.stockCardId : newId(),
      unitPrice: props.stockCard ? props.stockCard.unitPrice : 0,
      entityName: entity?.entityName,
      balances: balances,
      entries: entries,
      auth: {
        userId: user.userId,
        name: `${user.firstName} ${user.lastName}`,
        email: user.email!
      }
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

  const onSourceReportSelected = async (report: InventoryReport) => {
    setSourceReport(report);
    if (stockCard === null) return;

    let collectionQuery = query(collection(firestore, inventoryCollection,
        report.inventoryReportId, inventoryItems), where(assetStockNumber, "==", stockCard!.stockNumber));
    let snapshot = await getDocs(collectionQuery);
    let items = snapshot.docs.map((doc) => doc.data() as InventoryReportItem)
    if (items.length < 1) {
      await show({
        title: t("dialog.stock_number_not_found_on_report"),
        description: t("dialog.stock_number_not_found_on_report_summary"),
        dismissButtonText: t("button.cancel")
      });
      return;
    }

    let inventoryReportItem: InventoryReportItem = items[0];
    let current = Array.from(entries);
    let currentBalances = balances;
    for (let index = 0; index < current.length; index++) {
      const entry: StockCardEntry = current[index];
      if (inventoryReportItem.onHandCount < entry.issueQuantity) {
        await show({
          title: t("dialog.issued_is_more_than_current"),
          description: t("dialog.issued_is_more_than_current_summary"),
          dismissButtonText: t("button.cancel")
        });
        break;
      }

      if (index >= 0) {
        // Get the current values of the balances from the state and the
        // appropriate entry from it using the report's inventoryReportId

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
          current[index] = {
            ...entry,
            receivedQuantity: currentEntry.remaining,
            inventoryReportSourceId: report.inventoryReportId
          };
        } else {
          // Create a new record and subtract the onHandCount values of the report as this entry
          // is the first to use it as the source, do the same of the entry
          currentBalances[report.inventoryReportId] = {
            entries: {
              [`${entry.stockCardEntryId}`]: inventoryReportItem.onHandCount - entry.issueQuantity,
            },
            remaining: inventoryReportItem.onHandCount - entry.issueQuantity,
          };
          current[index] = {
            ...entry,
            receivedQuantity: inventoryReportItem.onHandCount,
            inventoryReportSourceId: report.inventoryReportId
          };
        }
        setBalances(currentBalances);
      }
    }
    setEntries(current);
    setBalances(currentBalances);
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
          stockCardEntryId: issuedItem.issuedReportItemId,
          receivedQuantity: 0,
          requestedQuantity: 0,
          issueQuantity: issuedItem.quantityIssued,
          issueOffice: issuedItem.responsibilityCenter
        }
        arr.push(entry);
        total += entry.issueQuantity;
      });

      console.log(arr);
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
        <EditorRoot>
          <EditorAppBar
            title={t(props.isCreate ? "dialog.stock_card_create" : "dialog.stock_card_update")}
            loading={isWriting}
            onConfirm={onSubmit}
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
                  <TextField
                    label={t("field.entity")}
                    value={t("template.entity", { name: entity?.entityName, position: entity?.entityPosition })}
                    disabled={isWriting}
                    InputProps={{
                      readOnly: true,
                    }}/>
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
                  <TextField
                    value={sourceReport ? sourceReport.fundCluster : t("field.not_set")}
                    label={t("field.inventory_report_source")}
                    disabled={isWriting}
                    InputProps={{
                      readOnly: true,
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton onClick={onInventoryPickerInvoke} edge="end">
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
        isOpen={reportPickerOpen}
        stockNumber={stockCard && stockCard.stockNumber}
        onItemSelected={onSourceReportSelected}
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