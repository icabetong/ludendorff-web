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
import { DatePicker, LocalizationProvider } from "@mui/lab";
import DateAdapter from '@mui/lab/AdapterDateFns';
import { AddRounded } from "@mui/icons-material";
import { GridRowId, GridSelectionModel } from "@mui/x-data-grid";
import { useSnackbar } from "notistack";
import { Timestamp } from "firebase/firestore";
import { InventoryReport, InventoryReportItem, InventoryReportRepository } from "./InventoryReport";
import { InventoryReportItemEditor } from "./InventoryReportItemEditor";
import { initialState, reducer } from "./InventoryReportItemEditorReducer";
import InventoryReportItemList from "./InventoryReportItemList";
import InventoryReportItemDataGrid from "./InventoryReportItemDataGrid";
import { useEntity } from "../entity/UseEntity";
import { EditorAppBar } from "../../components/editor/EditorAppBar";
import { EditorContent } from "../../components/editor/EditorContent";
import { EditorRoot } from "../../components/editor/EditorRoot";
import { SlideUpTransition } from "../../components/transition/SlideUpTransition";
import { isDev, newId } from "../../shared/utils";
import { format } from "date-fns";

type InventoryReportEditorProps = {
  isOpen: boolean,
  isCreate: boolean,
  report: InventoryReport | undefined,
  onDismiss: () => void,
}

export type FormValues = {
  fundCluster: string,
}

const InventoryReportEditor = (props: InventoryReportEditorProps) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const { enqueueSnackbar } = useSnackbar();
  const { entity } = useEntity();
  const smBreakpoint = useMediaQuery(theme.breakpoints.down('sm'));
  const { handleSubmit, formState: { errors }, reset, control } = useForm<FormValues>();
  const [yearMonth, setYearMonth] = useState<string | null>(null);
  const [date, setDate] = useState<Date | null>(new Date());
  const [items, setItems] = useState<InventoryReportItem[]>([]);
  const [checked, setChecked] = useState<string[]>([]);
  const [isFetching, setFetching] = useState(false);
  const [isWriting, setWriting] = useState(false);
  const [state, dispatch] = useReducer(reducer, initialState);

  const onDismiss = () => {
    setWriting(false);
    props.onDismiss();
  }

  useEffect(() => {
    if (props.isOpen) {
      reset({
        fundCluster: props.report?.fundCluster ? props.report?.fundCluster : "",
      });
      setDate(props.report?.accountabilityDate ? props.report?.accountabilityDate?.toDate() : null);
      setYearMonth(props.report?.yearMonth ? props.report?.yearMonth : null);
    }
  }, [props.isOpen, props.report, reset])

  useEffect(() => {
    const fetchItems = async () => {
      if (props.report) {
        const { inventoryReportId } = props.report;

        return await InventoryReportRepository.fetch(inventoryReportId);
      } else return [];
    }

    setFetching(true);
    fetchItems()
      .then((arr) => setItems(arr))
      .catch((error) => {
        if (isDev) console.log(error)
      })
      .finally(() => setFetching(false));
  }, [props.report]);

  const onEditorCreate = () => dispatch({ type: "create" })
  const onEditorDismiss = () => dispatch({ type: "dismiss" })
  const onEditorUpdate = (item: InventoryReportItem) => dispatch({ type: "update", payload: item })
  const onEditorCommit = (item: InventoryReportItem) => {
    let currentItems: InventoryReportItem[] = [...items];
    let index = currentItems.findIndex((i) => i.stockNumber === item.stockNumber);
    if (index < 0) {
      currentItems.push(item);
    } else {
      currentItems[index] = item;
    }
    setItems(currentItems);
    onEditorDismiss();
  }

  const onCheckedRowsChanged = (model: GridSelectionModel) => setChecked(model.map((id: GridRowId) => `${id}`));
  const onCheckedRowsRemove = () => {
    let currentItems = Array.from(items);
    checked.forEach((id: string) => {
      currentItems = currentItems.filter((i) => i.stockNumber !== id);
    });
    setItems(currentItems);
  }

  const onSubmit = (data: FormValues) => {
    if (!yearMonth) {
      enqueueSnackbar(t("feedback.empty_year_month"));
      return;
    }
    if (!date) {
      enqueueSnackbar(t("feedback.empty_accountability_date"));
      return;
    }

    setWriting(true);
    const inventoryReport: InventoryReport = {
      inventoryReportId: props.report ? props.report.inventoryReportId : newId(),
      ...data,
      items: items,
      yearMonth: format(Date.parse(yearMonth), "MMMM yyyy"),
      accountabilityDate: Timestamp.fromDate(date)
    }

    if (props.isCreate) {
      InventoryReportRepository.create(inventoryReport)
        .then(() => enqueueSnackbar(t("feedback.inventory_created")))
        .catch((error) => {
          enqueueSnackbar(t("feedback.inventory_create_error"))
          if (isDev) console.log(error)
        })
        .finally(onDismiss)
    } else {
      InventoryReportRepository.update(inventoryReport)
        .then(() => enqueueSnackbar(t("feedback.inventory_updated")))
        .catch((error) => {
          enqueueSnackbar(t("feedback.inventory_update_error"))
          if (isDev) console.log(error)
        })
        .finally(onDismiss)
    }
  }

  return (
    <>
      <Dialog open={props.isOpen} TransitionComponent={SlideUpTransition} fullScreen>
        <EditorRoot onSubmit={handleSubmit(onSubmit)}>
          <EditorAppBar
            title={t(props.isCreate ? "dialog.inventory_create" : "dialog.inventory_update")}
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
                <Grid
                  item
                  xs={6}
                  sx={{ maxWidth: '100%', pt: 0, pl: 0 }}>
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
                  <TextField
                    label={t("field.entity")}
                    value={t("template.entity", { name: entity?.entityName, position: entity?.entityPosition })}
                    disabled={isWriting}
                    InputProps={{
                      readOnly: true,
                    }}/>
                </Grid>
                <Grid
                  item
                  xs={6}
                  sx={{ maxWidth: '100%', pt: 0, pl: 0 }}>
                  <LocalizationProvider dateAdapter={DateAdapter}>
                    <Box>
                      <DatePicker
                        inputFormat="MM/yyyy"
                        mask="__/____"
                        views={['year', 'month']}
                        label={t("field.year_month")}
                        value={yearMonth}
                        disabled={isWriting}
                        onChange={setYearMonth}
                        renderInput={(params) => <TextField {...params} helperText={null}/>}
                      />
                    </Box>
                  </LocalizationProvider>
                  <LocalizationProvider dateAdapter={DateAdapter}>
                    <Box>
                      <DatePicker
                        inputFormat="MM/dd/yyyy"
                        mask="__/__/____"
                        label={t("field.accountability_date")}
                        value={date}
                        onChange={setDate}
                        disabled={isWriting}
                        renderInput={(params) => <TextField {...params} helperText={null}/>}
                      />
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
                  <InventoryReportItemList
                    items={items}
                    onItemSelected={onEditorUpdate}/>
                  <Button fullWidth startIcon={<AddRounded/>} onClick={onEditorCreate}>
                    {t("button.add")}
                  </Button>
                </List>
              : <InventoryReportItemDataGrid
                  items={items}
                  isLoading={isFetching}
                  onAddAction={onEditorCreate}
                  onRemoveAction={onCheckedRowsRemove}
                  onItemSelected={onEditorUpdate}
                  onCheckedRowsChanged={onCheckedRowsChanged}/>
            }
          </EditorContent>
        </EditorRoot>
      </Dialog>
      <InventoryReportItemEditor
        isOpen={state.isOpen}
        isCreate={state.isCreate}
        item={state.item}
        onSubmit={onEditorCommit}
        onDismiss={onEditorDismiss}/>
    </>
  )

}

export default InventoryReportEditor;