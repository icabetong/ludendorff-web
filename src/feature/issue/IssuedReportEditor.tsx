import { IssuedReport, IssuedReportItem, IssuedReportRepository } from "./IssuedReport";
import { useTranslation } from "react-i18next";
import {
  Box,
  Button,
  Dialog,
  Divider,
  FormLabel,
  Grid,
  List,
  TextField,
  Typography,
  useMediaQuery,
  useTheme
} from "@mui/material";
import { useSnackbar } from "notistack";
import { useForm, Controller } from "react-hook-form";
import { useEffect, useReducer, useState } from "react";
import { isDev, newId } from "../../shared/utils";
import { ActionType, initialState, reducer } from "./IssuedReportItemEditorReducer";
import { Timestamp } from "firebase/firestore";
import DateAdapter from "@mui/lab/AdapterDateFns";
import { DatePicker, LocalizationProvider } from "@mui/lab";
import IssuedReportItemList from "./IssuedReportItemList";
import { AddRounded } from "@mui/icons-material";
import { IssuedReportItemEditor } from "./IssuedReportItemEditor";
import { EditorAppBar, EditorContent, EditorRoot, Transition } from "../../components/EditorComponent";
import IssuedReportItemDataGrid from "./IssuedReportItemDataGrid";
import { GridSelectionModel } from "@mui/x-data-grid";

type IssuedReportEditorProps = {
  isOpen: boolean,
  isCreate: boolean,
  report: IssuedReport | undefined,
  onDismiss: () => void,
}

export type FormValues = {
  fundCluster: string,
  entityName: string,
  serialNumber: string,
}

const IssuedReportEditor = (props: IssuedReportEditorProps) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const { enqueueSnackbar } = useSnackbar();
  const smBreakpoint = useMediaQuery(theme.breakpoints.down('sm'));
  const { handleSubmit, formState: { errors }, control, reset } = useForm<FormValues>();
  const [date, setDate] = useState<Date | null>(new Date());
  const [items, setItems] = useState<IssuedReportItem[]>([]);
  const [checked, setChecked] = useState<string[]>([]);
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    setDate(props.report?.date ? props.report?.date?.toDate() : null)
  }, [props.report])

  useEffect(() => {
    if (props.isOpen) {
      reset({
        fundCluster: props.report?.fundCluster,
        entityName: props.report?.entityName,
        serialNumber: props.report?.serialNumber
      })
    }
  }, [props.isOpen, props.report, reset])

  useEffect(() => {
    const fetchItems = async () => {
      if (props.report) {
        const { issuedReportId } = props.report;

        return await IssuedReportRepository.fetch(issuedReportId);
      } else return [];
    }

    fetchItems()
      .then((arr) => setItems(arr))
      .catch((error) => {
        if (isDev) console.log(error);
      })
  }, [props.report]);

  const onEditorCreate = () => dispatch({ type: ActionType.CREATE });
  const onEditorDismiss = () => dispatch({ type: ActionType.DISMISS });
  const onEditorUpdate = (item: IssuedReportItem) => dispatch({ type: ActionType.UPDATE, payload: item });
  const onEditorCommit = (item: IssuedReportItem) => {
    let currentItems = Array.from(items);
    let index = currentItems.findIndex((i) => i.stockNumber === item.stockNumber);
    if (index < 0) {
      currentItems.push(item);
    } else {
      currentItems[index] = item;
    }
    setItems(currentItems);
  }

  const onCheckedRowsChanged = (model: GridSelectionModel) => setChecked(model.map((id) => `${id}`))
  const onCheckedRowsRemove = () => {
    let currentItems = Array.from(items);
    checked.forEach((id: string) => {
      currentItems = currentItems.filter((i) => i.stockNumber !== id);
    });
    setItems(currentItems);
  }

  const onSubmit = (data: FormValues) => {
    if (!date) {
      return;
    }

    const issuedReport: IssuedReport = {
      issuedReportId: props.report ? props.report.issuedReportId : newId(),
      ...data,
      items: items,
      date: Timestamp.fromDate(date),
    }

    if (props.isCreate) {
      IssuedReportRepository.create(issuedReport)
        .then(() => enqueueSnackbar(t("feedback.issued_report_created")))
        .catch((error) => {
          enqueueSnackbar(t("feedback.issued_report_create_error"))
          if (isDev) console.log(error);
        })
        .finally(props.onDismiss)
    } else {
      IssuedReportRepository.update(issuedReport)
        .then(() => enqueueSnackbar(t("feedback.issued_report_updated")))
        .catch((error) => {
          enqueueSnackbar(t("feedback.issued_report_update_error"))
          if (isDev) console.log(error);
        })
        .finally(props.onDismiss)
    }
  }

  return (
    <>
      <Dialog
        fullScreen={true}
        open={props.isOpen}
        onClose={props.onDismiss}
        TransitionComponent={Transition}>
        <EditorRoot onSubmit={handleSubmit(onSubmit)}>
          <EditorAppBar title={t("dialog.details_issued")} onDismiss={props.onDismiss}/>
          <EditorContent>
            <Box>
              <Grid container direction={smBreakpoint ? "column" : "row"} alignItems="stretch" justifyContent="center"
                    spacing={smBreakpoint ? 0 : 4}>
                <Grid item xs={6} sx={{ maxWidth: '100%', pt: 0, pl: 0 }}>
                  <Controller
                    name="fundCluster"
                    control={control}
                    render={({ field: { ref, ...inputProps }}) => (
                      <TextField
                        {...inputProps}
                        autoFocus
                        type="text"
                        inputRef={ref}
                        label={t("field.fund_cluster")}
                        error={errors.fundCluster !== undefined}
                        helperText={errors.fundCluster?.message && t(errors.fundCluster?.message)}/>
                    )}
                    rules={{ required: { value: true, message: "feedback.empty_fund_cluster" }}}/>
                  <Controller
                    name="serialNumber"
                    control={control}
                    render={({ field: { ref, ...inputProps }}) => (
                      <TextField
                        {...inputProps}
                        type="text"
                        inputRef={ref}
                        label={t("field.serial_number")}
                        error={errors.serialNumber !== undefined}
                        helperText={errors.serialNumber?.message && t(errors.serialNumber?.message)}/>
                    )}
                    rules={{ required: { value: true, message: "feedback.empty_serial_number" }}}/>
                </Grid>
                <Grid item xs={6} sx={{ maxWidth: '100%', pt: 0, pl: 0 }}>
                  <Controller
                    name="entityName"
                    control={control}
                    render={({ field: { ref, ...inputProps }}) => (
                      <TextField
                        {...inputProps}
                        inputRef={ref}
                        label={t("field.entity_name")}
                        error={errors.entityName !== undefined}
                        helperText={errors.entityName?.message && t(errors.entityName?.message)}/>
                    )}
                    rules={{ required: { value: true, message: "feedback.empty_entity_name" }}}/>
                  <LocalizationProvider dateAdapter={DateAdapter}>
                    <Box>
                      <DatePicker
                        inputFormat="MM/dd/yyyy"
                        mask="__/__/____"
                        label={t("field.date")}
                        value={date}
                        onChange={setDate}
                        renderInput={(params) => <TextField {...params} helperText={null}/>}/>
                    </Box>
                  </LocalizationProvider>
                </Grid>
              </Grid>
            </Box>
            {!smBreakpoint && <Divider sx={{ my: 2 }}/>}
            <FormLabel component="legend">
              <Typography variant="body2">{t("field.items")}</Typography>
            </FormLabel>
            {smBreakpoint
              ? <List>
                <IssuedReportItemList
                  items={items}
                  onItemSelected={onEditorUpdate}/>
                <Button
                  fullWidth
                  startIcon={<AddRounded/>}
                  onClick={onEditorCreate}>
                  {t("button.add")}
                </Button>
              </List>
              : <IssuedReportItemDataGrid
                onAddAction={onEditorCreate}
                onRemoveAction={onCheckedRowsRemove}
                onItemSelected={onEditorUpdate}
                items={items}
                onCheckedRowsChanged={onCheckedRowsChanged}/>
            }
          </EditorContent>
        </EditorRoot>
      </Dialog>
      <IssuedReportItemEditor
        isOpen={state.isOpen}
        isCreate={state.isCreate}
        item={state.item}
        onSubmit={onEditorCommit}
        onDismiss={onEditorDismiss}/>
    </>
  )
}

export default IssuedReportEditor;