import { StockCardEntry } from "./StockCard";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import { Box, Button, Container, Dialog, DialogActions, DialogContent, DialogTitle, TextField } from "@mui/material";
import DateAdapter from "@mui/lab/AdapterDateFns";
import { DatePicker, LocalizationProvider } from "@mui/lab";
import { useState } from "react";
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
  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>();
  const [date, setDate] = useState<Date | null>(new Date());

  const onSubmit = (values: FormValues) => {
    if (!date) {
      return;
    }

    let entry: StockCardEntry = {
      stockCardEntryId: props.entry ? props.entry.stockCardEntryId : newId(),
      date: Timestamp.fromDate(date),
      ...values,
    }
    props.onSubmit(entry)
    props.onDismiss()
  }

  return (
    <Dialog
      open={props.isOpen}
      fullWidth={true}
      maxWidth="xs"
      onClose={props.onDismiss}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogTitle>{t("dialog.details_stock_card_entry")}</DialogTitle>
        <DialogContent>
          <Container disableGutters>
            <LocalizationProvider dateAdapter={ DateAdapter }>
              <Box>
                <DatePicker
                  inputFormat="MM/dd/yyyy"
                  mask="__/__/____"
                  label={ t("field.accountability_date") }
                  value={ date }
                  onChange={ setDate }
                  renderInput={ (params) => <TextField { ...params } helperText={ null }/> }
                />
              </Box>
            </LocalizationProvider>
            <TextField
              autoFocus
              id="reference"
              type="text"
              label={t("field.reference")}
              defaultValue={props.entry && props.entry.reference}
              error={errors.reference !== undefined}
              helperText={errors.reference?.message && t(errors.reference?.message)}
              {...register("reference", { required: "feedback.empty_reference" })}/>
            <TextField
              id="receiptQuantity"
              type="number"
              label={t("field.receipt_quantity")}
              defaultValue={props.entry && props.entry.receiptQuantity}
              error={errors.receiptQuantity !== undefined}
              helperText={errors.receiptQuantity?.message && t(errors.receiptQuantity?.message)}
              inputProps={{ inputMode: 'numeric', pattern: '[0-9]*', min: 0 }}
              {...register("receiptQuantity", { required: "feedback.empty_receipt_quantity" })}/>
            <TextField
              id="requestedQuantity"
              type="number"
              label={t("field.requested_quantity")}
              defaultValue={props.entry && props.entry.requestedQuantity}
              error={errors.requestedQuantity !== undefined}
              helperText={errors.requestedQuantity?.message && t(errors.requestedQuantity?.message)}
              inputProps={{ inputMode: 'numeric', pattern: '[0-9]*', min: 0 }}
              {...register("requestedQuantity", { required: "feedback.empty_request_quantity"})}/>
            <TextField
              id="issueQuantity"
              type="number"
              label={t("field.issue_quantity")}
              defaultValue={props.entry && props.entry.issueQuantity}
              error={errors.issueQuantity !== undefined}
              helperText={errors.issueQuantity?.message && t(errors.issueQuantity?.message)}
              inputProps={{ inputMode: 'numeric', pattern: '[0-9]*', min: 0 }}
              {...register("issueQuantity", { required: "feedback.empty_issue_quantity" })}/>
            <TextField
              id="issueOffice"
              type="string"
              label={t("field.issue_office")}
              defaultValue={props.entry && props.entry.issueOffice}
              error={errors.issueOffice !== undefined}
              helperText={errors.issueOffice?.message && t(errors.issueOffice?.message)}
              {...register("issueOffice", { required: "feedback.empty_issue_office" })}/>
            <TextField
              id="balanceQuantity"
              type="number"
              label={t("field.balance_quantity")}
              defaultValue={props.entry && props.entry.balanceQuantity}
              error={errors.balanceQuantity !== undefined}
              helperText={errors.balanceQuantity?.message && t(errors.balanceQuantity?.message)}
              inputProps={{ inputMode: 'numeric', pattern: '[0-9]*', min: 0 }}
              {...register("balanceQuantity", { required: "feedback.empty_balance_quantity" })}/>
            <TextField
              id="balanceTotalPrice"
              type="number"
              label={t("field.balance_total_price")}
              defaultValue={props.entry && props.entry.balanceTotalPrice}
              error={errors.balanceTotalPrice !== undefined}
              helperText={errors.balanceTotalPrice?.message && t(errors.balanceTotalPrice?.message)}
              inputProps={{ inputMode: 'numeric', pattern: '[0-9]*', min: 0 }}
              {...register("balanceTotalPrice", { required: "feedback.empty_balance_total_price" })}/>
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
            type="submit">
            {t("button.save")}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}