import { StockCardEntry } from "./StockCard";
import { useTranslation } from "react-i18next";
import { useForm, Controller } from "react-hook-form";
import { Box, Button, Container, Dialog, DialogActions, DialogContent, DialogTitle, TextField } from "@mui/material";
import DateAdapter from "@mui/lab/AdapterDateFns";
import { DatePicker, LocalizationProvider } from "@mui/lab";
import { useState, useEffect } from "react";
import { Timestamp } from "firebase/firestore";
import { newId } from "../../shared/utils";

export type FormValues = {
  reference?: string,
  receiptQuantity: number,
  requestedQuantity: number,
  issueQuantity: number,
  issueOffice?: string,
  balanceQuantity: number,
  balanceTotalPrice: number,
}

type StockCardEntryEditorProps = {
  isOpen: boolean,
  isCreate: boolean,
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
        receiptQuantity: props.entry ? props.entry?.receiptQuantity : 0,
        requestedQuantity: props.entry?.requestedQuantity ? props.entry?.requestedQuantity : 0,
        issueQuantity: props.entry?.issueQuantity ? props.entry?.issueQuantity : 0,
        issueOffice: props.entry?.issueOffice,
        balanceQuantity: props.entry?.balanceQuantity ? props.entry?.balanceQuantity : 0,
        balanceTotalPrice: props.entry?.balanceTotalPrice ? props.entry?.balanceTotalPrice : 0,
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
      receiptQuantity: parseInt(`${data.receiptQuantity}`),
      requestedQuantity: parseInt(`${data.requestedQuantity}`),
      issueQuantity: parseInt(`${data.issueQuantity}`),
      balanceQuantity: parseInt(`${data.balanceQuantity}`),
      balanceTotalPrice: parseFloat(`${data.balanceTotalPrice}`)
    }
    props.onSubmit(entry);
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
              name="receiptQuantity"
              control={control}
              render={({ field: { ref, ...inputProps }}) => (
                <TextField
                  {...inputProps}
                  type="number"
                  inputRef={ref}
                  label={t("field.receipt_quantity")}
                  error={errors.receiptQuantity !== undefined}
                  helperText={errors.receiptQuantity?.message && t(errors.receiptQuantity?.message)}
                  inputProps={{ inputMode: 'numeric', pattern: '[0-9]*', min: 0 }}/>
              )}
              rules={{ required: { value: true, message: "feedback.empty_receipt_quantity" }}}/>
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
                  inputProps={{ inputMode: 'numeric', pattern: '[0-9]*', min: 0 }}/>
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
                  helperText={errors.issueOffice?.message && t(errors.issueOffice?.message)}/>
              )}
              rules={{ required: { value: true, message: "feedback.empty_issue_office" }}}/>
            <Controller
              name="balanceQuantity"
              control={control}
              render={({ field: { ref, ...inputProps }}) => (
                <TextField
                  {...inputProps}
                  type="number"
                  label={t("field.balance_quantity")}
                  error={errors.balanceQuantity !== undefined}
                  helperText={errors.balanceQuantity?.message && t(errors.balanceQuantity?.message)}
                  inputProps={{ inputMode: 'numeric', pattern: '[0-9]*', min: 0 }}/>
              )}
              rules={{ required: { value: true, message: "feedback.empty_balance_quantity" }}}/>
            <Controller
              name="balanceTotalPrice"
              control={control}
              render={({ field: { ref, ...inputProps }}) => (
                <TextField
                  {...inputProps}
                  type="number"
                  inputRef={ref}
                  label={t("field.balance_total_price")}
                  error={errors.balanceTotalPrice !== undefined}
                  helperText={errors.balanceTotalPrice?.message && t(errors.balanceTotalPrice?.message)}
                  inputProps={{ inputMode: 'numeric', pattern: '[0-9]*', min: 0 }}/>
              )}
              rules={{ required: { value: true, message: "feedback.empty_balance_total_price" }}}/>
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