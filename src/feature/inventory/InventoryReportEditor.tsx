import { InventoryReport, InventoryReportItem, InventoryReportRepository } from "./InventoryReport";
import { useTranslation } from "react-i18next";
import { useSnackbar } from "notistack";
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
import { useEffect, useReducer, useState } from "react";
import { useForm } from "react-hook-form";
import { DatePicker, LocalizationProvider } from "@mui/lab";
import DateAdapter from '@mui/lab/AdapterDateFns';
import { ActionType, initialState, reducer } from "./InventoryReportItemEditorReducer";
import { InventoryReportItemEditor } from "./InventoryReportItemEditor";
import { isDev, newId } from "../../shared/utils";
import { format } from "date-fns";
import { Timestamp } from "firebase/firestore";
import { EditorAppBar, EditorContent, EditorRoot, Transition } from "../../components/EditorComponent";
import InventoryReportItemDataGrid from "./InventoryReportItemDataGrid";
import InventoryReportItemList from "./InventoryReportItemList";
import { AddRounded } from "@mui/icons-material";
import { GridRowId, GridSelectionModel } from "@mui/x-data-grid";

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
  const smBreakpoint = useMediaQuery(theme.breakpoints.down('sm'));
  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>();
  const [yearMonth, setYearMonth] = useState<Date | null>(new Date());
  const [date, setDate] = useState<Date | null>(new Date());
  const [items, setItems] = useState<InventoryReportItem[]>([]);
  const [checked, setChecked] = useState<string[]>([]);
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    const fetchItems = async () => {
      if (props.report) {
        const { inventoryReportId } = props.report;

        return await InventoryReportRepository.fetch(inventoryReportId);
      } else return [];
    }

    fetchItems()
      .then((arr) => setItems(arr))
      .catch((error) => {
        if (isDev) console.log(error)
      });
  }, [props.report]);

  const onEditorCreate = () => dispatch({ type: ActionType.CREATE })
  const onEditorDismiss = () => dispatch({ type: ActionType.DISMISS })
  const onEditorUpdate = (item: InventoryReportItem) => dispatch({ type: ActionType.UPDATE, payload: item })
  const onEditorCommit = (item: InventoryReportItem) => {
    let currentItems: InventoryReportItem[] = [...items];
    let index = currentItems.findIndex((i) => i.stockNumber === item.stockNumber);
    if (index < 0) {
      currentItems.push(item);
    } else {
      currentItems[index] = item;
    }
    setItems(currentItems);
  }

  const onCheckedRowsChanged = (model: GridSelectionModel) => setChecked(model.map((id: GridRowId) => `${id}`));
  const onCheckedRowsRemove = () => {
    let currentItems = Array.from(items);
    checked.forEach((id: string) => {
      currentItems = currentItems.filter((i) => i.stockNumber !== id);
    })
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

    const inventoryReport: InventoryReport = {
      inventoryReportId: props.report ? props.report.inventoryReportId : newId(),
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

  return (
    <>
      <Dialog
        fullScreen={true}
        open={props.isOpen}
        onClose={props.onDismiss}
        TransitionComponent={Transition}>
        <EditorRoot onSubmit={handleSubmit(onSubmit)}>
          <EditorAppBar title={t("dialog.details_inventory")} onDismiss={props.onDismiss}/>
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
                  <TextField
                    autoFocus
                    id="fundCluster"
                    type="text"
                    label={t("field.fund_cluster")}
                    error={errors.fundCluster !== undefined}
                    helperText={errors.fundCluster?.message && t(errors.fundCluster?.message)}
                    defaultValue={props.report && props.report.fundCluster}
                    {...register('fundCluster', { required: "feedback.empty_fund_cluster" })}/>
                  <TextField
                    id="entityName"
                    type="text"
                    label={t("field.entity_name")}
                    error={errors.entityName !== undefined}
                    helperText={errors.entityName?.message && t(errors.entityName?.message)}
                    defaultValue={props.report && props.report.entityName}
                    placeholder={t("placeholder.entity_name")}
                    {...register("entityName", { required: "feedback.empty_entity_name" })}/>
                  <TextField
                    id="entityPosition"
                    type="text"
                    label={t("field.entity_position")}
                    error={errors.entityPosition !== undefined}
                    helperText={errors.entityPosition?.message && t(errors.entityPosition?.message)}
                    defaultValue={props.report && props.report.entityPosition}
                    placeholder={t("placeholder.entity_position")}
                    {...register("entityPosition", { required: "feedback.empty_entity_position" })}/>
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