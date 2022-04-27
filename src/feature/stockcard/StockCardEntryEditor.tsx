import { StockCard, StockCardEntry } from "./StockCard";
import { useTranslation } from "react-i18next";
import { useForm, Controller } from "react-hook-form";
import {
  Box,
  Button,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  InputAdornment,
  TextField
} from "@mui/material";
import DateAdapter from "@mui/lab/AdapterDateFns";
import { DatePicker, LocalizationProvider } from "@mui/lab";
import { useState, useEffect } from "react";
import { Timestamp } from "firebase/firestore";
import { newId } from "../../shared/utils";
import { Balances, Entry } from "../shared/types/Balances";

export type FormValues = {
  reference?: string,
  receivedQuantity: number,
  requestedQuantity: number,
  issueQuantity: number,
  issueOffice?: string,
}

type StockCardEntryEditorProps = {
  isOpen: boolean,
  isCreate: boolean,
  balances: Balances,
  stockCard?: StockCard,
  entry?: StockCardEntry,
  onSubmit: (item: StockCardEntry) => void,
  onDismiss: () => void,
}

export const StockCardEntryEditor = (props: StockCardEntryEditorProps) => {
  const { t } = useTranslation();
  const { handleSubmit, formState: { errors }, reset, control } = useForm<FormValues>();
  const [date, setDate] = useState<Date | null>(new Date());

  useEffect(() => {
    setDate(props.entry?.date ? props.entry?.date?.toDate() : null)
  }, [props.entry])

  useEffect(() => {
    if (props.isOpen) {
      reset({
        reference: props.entry?.reference ? props.entry?.reference : "",
        receivedQuantity: props.entry ? props.entry?.receivedQuantity : 0,
        requestedQuantity: props.entry?.requestedQuantity ? props.entry?.requestedQuantity : 0,
        issueQuantity: props.entry?.issueQuantity ? props.entry?.issueQuantity : 0,
        issueOffice: props.entry?.issueOffice,
      })
    }
  }, [props.isOpen, props.entry, reset])

  const onDismiss = () => {
    props.onDismiss();
  }

  const onSubmit = (data: FormValues) => {
    if (!date) {
      return;
    }

    let entry: StockCardEntry = {
      ...data,
      stockCardEntryId: props.entry ? props.entry.stockCardEntryId : newId(),
      date: props.entry?.date ? props.entry?.date : Timestamp.fromDate(date),
      receivedQuantity: parseInt(`${data.receivedQuantity}`),
      requestedQuantity: parseInt(`${data.requestedQuantity}`),
      issueQuantity: parseInt(`${data.issueQuantity}`),
    }
    props.onSubmit(entry);
  }

  const getBalanceQuantity = () => {
    if (!props.entry?.inventoryReportSourceId)
      return 0;

    let entry: Entry = props.balances[props.entry?.inventoryReportSourceId];
    if (!entry) return 0;

    let quantityEntry = entry.entries[props.entry?.stockCardEntryId];
    return quantityEntry ? quantityEntry : 0;
  }

  const getBalanceTotalPrice = () => {
    if (!props.stockCard?.stockNumber) return 0;
    if (!props.entry?.inventoryReportSourceId) return 0;
    let unitPrice = props.stockCard ? props.stockCard.unitPrice : 0;

    let entry: Entry = props.balances[props.entry?.inventoryReportSourceId];
    if (!entry) return 0;

    let quantityEntry = entry.entries[props.entry?.stockCardEntryId];
    return (unitPrice * quantityEntry).toFixed(2);
  }

  return (
    <Dialog
      open={props.isOpen}
      fullWidth={true}
      maxWidth="xs">
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogTitle>{t("dialog.details_stock_card_entry")}</DialogTitle>
        <DialogContent>
          <Container disableGutters>
            <LocalizationProvider dateAdapter={DateAdapter}>
              <Box>
                <DatePicker
                  inputFormat="MM/dd/yyyy"
                  mask="__/__/____"
                  label={t("field.accountability_date")}
                  value={date}
                  onChange={setDate}
                  renderInput={(params) => <TextField {...params} helperText={null}/>}
                />
              </Box>
            </LocalizationProvider>
            <Controller
              name="reference"
              control={control}
              render={({ field: { ref, ...inputProps }}) => (
                <TextField
                  {...inputProps}
                  autoFocus
                  type="text"
                  inputRef={ref}
                  label={t("field.reference")}
                  error={errors.reference !== undefined}
                  helperText={errors.reference?.message && t(errors.reference?.message)}/>
              )}
              rules={{ required: { value: true, message: "feedback.empty_reference" }}}/>
            <Controller
              name="receivedQuantity"
              control={control}
              render={({ field: { ref, ...inputProps }}) => (
                <TextField
                  {...inputProps}
                  type="number"
                  inputRef={ref}
                  label={t("field.received_quantity")}
                  error={errors.receivedQuantity !== undefined}
                  helperText={errors.receivedQuantity?.message && t(errors.receivedQuantity?.message)}
                  inputProps={{ inputMode: 'numeric', pattern: '[0-9]*', min: 0 }}
                  InputProps={{ readOnly: true }}/>
              )}
              rules={{ required: { value: true, message: "feedback.empty_received_quantity" }}}/>
            <Controller
              name="requestedQuantity"
              control={control}
              render={({ field: { ref, ...inputProps }}) => (
                <TextField
                  {...inputProps}
                  type="number"
                  inputRef={ref}
                  label={t("field.requested_quantity")}
                  error={errors.requestedQuantity !== undefined}
                  helperText={errors.requestedQuantity?.message && t(errors.requestedQuantity?.message)}
                  inputProps={{ inputMode: 'numeric', pattern: '[0-9]*', min: 0 }}/>
              )}
              rules={{ required: { value: true, message: "feedback.empty_request_quantity" }}}/>
            <Controller
              name="issueQuantity"
              control={control}
              render={({ field: { ref, ...inputProps }}) => (
                <TextField
                  {...inputProps}
                  type="number"
                  inputRef={ref}
                  label={t("field.issue_quantity")}
                  error={errors.issueQuantity !== undefined}
                  helperText={errors.issueQuantity?.message && t(errors.issueQuantity?.message)}
                  inputProps={{ inputMode: 'numeric', pattern: '[0-9]*', min: 0 }}
                  InputProps={{ readOnly: true }}/>
              )}
              rules={{ required: { value: true, message: "feedback.empty_issue_quantity" }}}/>
            <Controller
              name="issueOffice"
              control={control}
              render={({ field: { ref, ...inputProps }}) => (
                <TextField
                  {...inputProps}
                  type="string"
                  inputRef={ref}
                  label={t("field.issue_office")}
                  error={errors.issueOffice !== undefined}
                  helperText={errors.issueOffice?.message && t(errors.issueOffice?.message)}
                  InputProps={{ readOnly: true }}/>
              )}
              rules={{ required: { value: true, message: "feedback.empty_issue_office" }}}/>
            <TextField
              type="number"
              label={t("field.balance_quantity")}
              value={getBalanceQuantity()}
              InputProps={{ readOnly: true }}/>
            <TextField
              type="number"
              label={t("field.balance_total_price")}
              value={getBalanceTotalPrice()}
              inputProps={{
                inputMode: 'numeric',
                pattern: '[0-9]*',
                min: 0,
                step: 0.01,
                type: "number",
              }}
              InputProps={{
                readOnly: true,
                startAdornment: (
                  <InputAdornment position="start">₱</InputAdornment>
                )
              }}/>
          </Container>
        </DialogContent>
        <DialogActions>
          <Button
            color="primary"
            onClick={onDismiss}>
            {t("button.cancel")}
          </Button>
          <Button
            color="primary"
            type="submit">
            {t("button.save")}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}