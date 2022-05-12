import { useEffect, useReducer, useState } from "react";
import { useTranslation } from "react-i18next";
import { useForm, Controller } from "react-hook-form";
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
import { GridSelectionModel } from "@mui/x-data-grid";
import { DatePicker, LocalizationProvider } from "@mui/lab";
import DateAdapter from "@mui/lab/AdapterDateFns";
import { AddRounded } from "@mui/icons-material";
import { useSnackbar } from "notistack";
import { Timestamp } from "firebase/firestore";

import { IssuedReport, IssuedReportItem, IssuedReportRepository } from "./IssuedReport";
import IssuedReportItemDataGrid from "./IssuedReportItemDataGrid";
import { IssuedReportItemEditor } from "./IssuedReportItemEditor";
import { initialState, reducer } from "./IssuedReportItemEditorReducer";
import IssuedReportItemList from "./IssuedReportItemList";
import { useEntity } from "../entity/UseEntity";
import { isDev, newId } from "../../shared/utils";
import { EditorAppBar, EditorContent, EditorRoot, SlideUpTransition } from "../../components";

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
  const { entity } = useEntity();
  const smBreakpoint = useMediaQuery(theme.breakpoints.down('sm'));
  const { handleSubmit, formState: { errors }, control, reset } = useForm<FormValues>();
  const [date, setDate] = useState<Date | null>(new Date());
  const [items, setItems] = useState<IssuedReportItem[]>([]);
  const [checked, setChecked] = useState<string[]>([]);
  const [isFetching, setFetching] = useState(false);
  const [isWriting, setWriting] = useState(false);
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    if (props.isOpen) {
      reset({
        fundCluster: props.report?.fundCluster ? props.report?.fundCluster : "",
        serialNumber: props.report?.serialNumber ? props.report?.serialNumber : ""
      });
      setDate(props.report?.date ? props.report?.date.toDate() : null);
    }
  }, [props.isOpen, props.report, reset])

  useEffect(() => {
    const fetchItems = async () => {
      if (props.report) {
        const { issuedReportId } = props.report;

        return await IssuedReportRepository.fetch(issuedReportId);
      } else return [];
    }

    setFetching(true);
    fetchItems()
      .then((arr) => setItems(arr))
      .catch((error) => {
        if (isDev) console.log(error);
      })
      .finally(() => setFetching(false));
  }, [props.report]);

  const onDismiss = () => {
    setWriting(false);
    props.onDismiss();
  }

  const onEditorCreate = () => dispatch({ type: "create" });
  const onEditorDismiss = () => dispatch({ type: "dismiss" });
  const onEditorUpdate = (item: IssuedReportItem) => dispatch({ type: "update", payload: item });
  const onEditorCommit = (item: IssuedReportItem) => {
    let currentItems = Array.from(items);
    let index = currentItems.findIndex((i) => i.issuedReportItemId === item.issuedReportItemId);
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
      currentItems = currentItems.filter((i) => i.issuedReportItemId !== id);
    });
    setItems(currentItems);
  }

  const onSubmit = (data: FormValues) => {
    if (!date) {
      return;
    }

    setWriting(true);
    const issuedReport: IssuedReport = {
      ...data,
      items: items,
      issuedReportId: props.report ? props.report.issuedReportId : newId(),
      date: Timestamp.fromDate(date),
      entityName: entity?.entityName,
    }

    if (props.isCreate) {
      IssuedReportRepository.create(issuedReport)
        .then(() => enqueueSnackbar(t("feedback.issued_report_created")))
        .catch((error) => {
          enqueueSnackbar(t("feedback.issued_report_create_error"))
          if (isDev) console.log(error);
        })
        .finally(onDismiss)
    } else {
      IssuedReportRepository.update(issuedReport)
        .then(() => enqueueSnackbar(t("feedback.issued_report_updated")))
        .catch((error) => {
          enqueueSnackbar(t("feedback.issued_report_update_error"))
          if (isDev) console.log(error);
        })
        .finally(onDismiss)
    }
  }

  return (
    <>
      <Dialog
        fullScreen={true}
        open={props.isOpen}
        onClose={props.onDismiss}
        TransitionComponent={SlideUpTransition}>
        <EditorRoot onSubmit={handleSubmit(onSubmit)}>
          <EditorAppBar title={t("dialog.details_issued")} loading={isWriting} onDismiss={props.onDismiss}/>
          <EditorContent>
            <Box>
              <Grid
                container
                direction={smBreakpoint ? "column" : "row"}
                alignItems="stretch"
                justifyContent="center"
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
                        helperText={errors.fundCluster?.message && t(errors.fundCluster?.message)}
                        disabled={isWriting}/>
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
                        helperText={errors.serialNumber?.message && t(errors.serialNumber?.message)}
                        disabled={isWriting}/>
                    )}
                    rules={{ required: { value: true, message: "feedback.empty_serial_number" }}}/>
                </Grid>
                <Grid item xs={6} sx={{ maxWidth: '100%', pt: 0, pl: 0 }}>
                  <TextField
                    label={t("field.entity")}
                    value={t("template.entity", { name: entity?.entityName, position: entity?.entityPosition })}
                    disabled={isWriting}
                    InputProps={{ readOnly: true }}/>
                  <LocalizationProvider dateAdapter={DateAdapter}>
                    <Box>
                      <DatePicker
                        inputFormat="MM/dd/yyyy"
                        mask="__/__/____"
                        label={t("field.date")}
                        value={date}
                        onChange={setDate}
                        renderInput={(params) => <TextField {...params} helperText={null}/>}
                        disabled={isWriting}/>
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
                  isLoading={isFetching}
                  items={items}
                  onAddAction={onEditorCreate}
                  onRemoveAction={onCheckedRowsRemove}
                  onItemSelected={onEditorUpdate}
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