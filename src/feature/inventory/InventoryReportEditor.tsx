import { InventoryReport, InventoryReportItem, InventoryReportRepository } from "./InventoryReport";
import { useTranslation } from "react-i18next";
import { useSnackbar } from "notistack";
import {
  Box,
  Button,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle, FormLabel, Grid, List, TextField, Typography,
  useMediaQuery,
  useTheme
} from "@mui/material";
import { useReducer, useState } from "react";
import { useForm } from "react-hook-form";
import { DatePicker, LocalizationProvider } from "@mui/lab";
import DateAdapter from '@mui/lab/AdapterDateFns';
import InventoryReportItemList from "./InventoryReportItemList";
import { AddRounded } from "@mui/icons-material";
import { ActionType, initialState, reducer } from "./InventoryReportItemEditorReducer";
import { InventoryReportItemEditor } from "./InventoryReportItemEditor";
import { isDev, newId } from "../../shared/utils";
import { format } from "date-fns";
import { Timestamp } from "firebase/firestore";

type InventoryReportEditorProps = {
  isOpen: boolean,
  isCreate: boolean,
  report: InventoryReport | undefined,
  onDismiss: () => void,
}

export type FormValues = {
  fundCluster: string,
  entityName: string,
  entityPosition: string,
}

const InventoryReportEditor = (props: InventoryReportEditorProps) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const { enqueueSnackbar } = useSnackbar();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>();
  const [isLoading, setLoading] = useState(true);
  const [yearMonth, setYearMonth] = useState<Date | null>(new Date());
  const [date, setDate] = useState<Date | null>(new Date());
  const [items, setItems] = useState<InventoryReportItem[]>([]);

  const onEditorCreate = () => dispatch({ type: ActionType.CREATE })
  const onEditorDismiss = () => dispatch({ type: ActionType.DISMISS })
  const onEditorUpdate = (item: InventoryReportItem) => dispatch({ type: ActionType.UPDATE, payload: item })
  const onEditorCommit = (item: InventoryReportItem) => {
    let currentItems = items;
    let index = currentItems.findIndex((i) => i.stockNumber === item.stockNumber);
    if (index < 0) {
      currentItems.push(item);
    } else {
      currentItems[index] = item;
    }
    setItems(items);
  }

  const onSubmit = (data: FormValues) => {
    if (!yearMonth || !date) {
      return;
    }

    const inventoryReport: InventoryReport = {
      inventoryReportId: newId(),
      ...data,
      items: items,
      yearMonth: format(yearMonth, "MMMM yyyy"),
      accountabilityDate: Timestamp.fromDate(date)
    }

    if (props.isCreate) {
      InventoryReportRepository.create(inventoryReport)
        .then(() => enqueueSnackbar(t("feedback.inventory_created")))
        .catch((error) => {
          enqueueSnackbar(t("feedback.inventory_create_error"))
          if (isDev) console.log(error)
        })
        .finally(props.onDismiss)
    } else {
      InventoryReportRepository.update(inventoryReport)
        .then(() => enqueueSnackbar(t("feedback.inventory_updated")))
        .catch((error) => {
          enqueueSnackbar(t("feedback.inventory_update_error"))
          if (isDev) console.log(error)
        })
        .finally(props.onDismiss)
    }
  }

  const [state, dispatch] = useReducer(reducer, initialState);

  return (
    <>
      <Dialog
        fullScreen={ isMobile }
        fullWidth={ true }
        maxWidth={ isMobile ? "xs" : "md" }
        open={ props.isOpen }
        onClose={ props.onDismiss }>
        <form onSubmit={ handleSubmit(onSubmit) }>
          <DialogTitle>{ t("dialog.details_inventory") }</DialogTitle>
          <DialogContent dividers={ true }>
            <Container>
              <Grid
                container
                direction={ isMobile ? "column" : "row" }
                alignItems="stretch"
                justifyContent="center"
                spacing={ isMobile ? 0 : 4 }>
                <Grid
                  item
                  xs={ 6 }
                  sx={ { maxWidth: '100%', pt: 0, pl: 0 } }>
                  <TextField
                    autoFocus
                    id="fundCluster"
                    type="text"
                    label={ t("field.fund_cluster") }
                    error={ errors.fundCluster !== undefined }
                    helperText={ errors.fundCluster?.message && t(errors.fundCluster?.message) }
                    defaultValue={ props.report && props.report.fundCluster }
                    { ...register('fundCluster', { required: "feedback.empty_fund_cluster" }) }/>
                  <TextField
                    id="entityName"
                    type="text"
                    label={ t("field.entity_name") }
                    error={ errors.entityName !== undefined }
                    helperText={ errors.entityName?.message && t(errors.entityName?.message) }
                    defaultValue={ props.report && props.report.entityName }
                    placeholder={ t("placeholder.entityName") }
                    { ...register("entityName", { required: "feedback.empty_entity_name" }) }/>
                  <TextField
                    id="entityPosition"
                    type="text"
                    label={ t("field.entity_position") }
                    error={ errors.entityPosition !== undefined }
                    helperText={ errors.entityPosition?.message && t(errors.entityPosition?.message) }
                    defaultValue={ props.report && props.report.entityPosition }
                    placeholder={ t("placeholder.entity_position") }
                    { ...register("entityPosition", { required: "feedback.empty_entity_position" }) }/>
                  <LocalizationProvider dateAdapter={ DateAdapter }>
                    <Box>
                      <DatePicker
                        inputFormat="MMMM yyyy"
                        views={ ['year', 'month'] }
                        label={ t("field.year_month") }
                        value={ yearMonth }
                        onChange={ setYearMonth }
                        renderInput={ (params) => <TextField { ...params } helperText={ null }/> }
                      />
                    </Box>
                  </LocalizationProvider>
                  <LocalizationProvider dateAdapter={ DateAdapter }>
                    <Box>
                      <DatePicker
                        inputFormat="MMMM d yyyy"
                        label={ t("field.accountability_date") }
                        value={ date }
                        onChange={ setDate }
                        renderInput={ (params) => <TextField { ...params } helperText={ null }/> }
                      />
                    </Box>
                  </LocalizationProvider>
                </Grid>
                <Grid
                  item
                  xs={ 6 }
                  sx={ { maxWidth: '100%', pt: 0, pl: 0 } }>
                  <FormLabel component="legend">
                    <Typography variant="body2">{ t("field.items") }</Typography>
                  </FormLabel>
                  <List>
                    <InventoryReportItemList
                      items={ items }
                      onItemSelected={ onEditorUpdate }/>
                    <Button
                      fullWidth
                      startIcon={ <AddRounded/> }
                      onClick={ onEditorCreate }>
                        { t("add") }
                    </Button>
                  </List>
                </Grid>
              </Grid>
            </Container>
          </DialogContent>
          <DialogActions>
            <Button
              color="primary"
              onClick={ props.onDismiss }>
              { t("button.cancel") }
            </Button>
            <Button
              color="primary"
              type="submit">
              { t("button.save") }
            </Button>
          </DialogActions>
        </form>
      </Dialog>
      { state.isOpen &&
        <InventoryReportItemEditor
          isOpen={ state.isOpen }
          isCreate={ state.isCreate }
          item={ state.item }
          onSubmit={ onEditorCommit }
          onDismiss={ onEditorDismiss }/>
      }
    </>
  )

}

export default InventoryReportEditor;