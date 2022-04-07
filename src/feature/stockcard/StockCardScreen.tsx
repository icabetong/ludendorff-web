import makeStyles from "@mui/styles/makeStyles";
import { Box, Button, Fab, Hidden, LinearProgress, Theme, IconButton, } from "@mui/material";
import { getDataGridTheme } from "../core/Core";
import { useTranslation } from "react-i18next";
import EmptyStateComponent from "../state/EmptyStates";
import {
  AddRounded,
  DeleteOutlineRounded,
  DescriptionOutlined,
  LocalAtmOutlined
} from "@mui/icons-material";
import { connectHits, InstantSearch } from "react-instantsearch-dom";
import { StockCard, StockCardRepository } from "./StockCard";
import { DataGrid, GridActionsCellItem, GridRowParams } from "@mui/x-data-grid";
import { ScreenProps } from "../shared/ScreenProps";
import GridLinearProgress from "../../components/GridLinearProgress";
import GridToolbar from "../../components/GridToolbar";
import GridEmptyRow from "../../components/GridEmptyRows";
import { useSnackbar } from "notistack";
import { usePermissions } from "../auth/AuthProvider";
import React, { useReducer, useRef, useState } from "react";
import { usePagination } from "use-pagination-firestore";
import { collection, orderBy, query } from "firebase/firestore";
import { firestore } from "../../index";
import {
  assetDescription,
  assetStockNumber,
  assetUnitOfMeasure,
  entityName,
  stockCardCollection,
  unitPrice
} from "../../shared/const";
import { ActionType, initialState, reducer } from "./StockCardEditorReducer";
import { DataGridPaginationController } from "../../components/PaginationController";
import { isDev } from "../../shared/utils";
import { Provider } from "../../components/Search";
import { ErrorNoPermissionState } from "../state/ErrorStates";
import StockCardList from "./StockCardList";
import { HitsProvided } from "react-instantsearch-core";
import { StockCardEditor } from "./StockCardEditor";
import ConfirmationDialog from "../shared/ConfirmationDialog";
import AdaptiveHeader from "../../components/AdaptiveHeader";
import useDensity from "../shared/useDensity";
import useColumnVisibilityModel from "../shared/useColumnVisibilityModel";
import useQueryLimit from "../shared/useQueryLimit";
import StockCardReport from "./StockCardReport";

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    height: '100%',
    width: '100%',
  },
  wrapper: {
    height: '90%',
    padding: '1.4em',
    ...getDataGridTheme(theme)
  }
}));

type StockCardScreenProps = ScreenProps
const StockCardScreen = (props: StockCardScreenProps) => {
  const classes = useStyles();
  const { t } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();
  const { canRead, canWrite } = usePermissions();
  const { density, onDensityChanged } = useDensity('stockCardDensity');
  const [stockCard, setStockCard] = useState<StockCard | null>(null);
  const [report, setReport] = useState<StockCard | undefined>(undefined);
  const [searchMode, setSearchMode] = useState(false);
  const { limit, onLimitChanged } = useQueryLimit('stockCardQueryLimit');

  const { items, isLoading, isStart, isEnd, getPrev, getNext } = usePagination<StockCard>(
    query(collection(firestore, stockCardCollection), orderBy(entityName, "asc")), {
      limit: limit
    }
  )

  const onRemoveInvoke = (stockCard: StockCard) => setStockCard(stockCard);
  const onRemoveDismiss = () => setStockCard(null);
  const onStockCardRemove = () => {
    if (stockCard) {
      StockCardRepository.remove(stockCard)
        .then(() => enqueueSnackbar(t("feedback.stock_card_removed")))
        .catch((error) => {
          enqueueSnackbar(t("feedback.stock_card_remove_error"))
          if (isDev) console.log(error)
        })
        .finally(onRemoveDismiss)
    }
  }

  const columns = [
    { field: entityName, headerName: t("field.entity_name"), flex: 1 },
    { field: assetStockNumber, headerName: t("field.stock_number"), flex: 1 },
    { field: assetDescription, headerName: t("field.asset_description"), flex: 1 },
    { field: unitPrice, headerName: t("field.unit_price"), flex: 1 },
    { field: assetUnitOfMeasure, headerName: t("field.unit_of_measure"), flex: 1 },
    {
      field: "actions",
      type: "actions",
      flex: 0.5,
      getActions: (params: GridRowParams) => [
        <GridActionsCellItem
          icon={<DeleteOutlineRounded/>}
          label={t("button.delete")}
          onClick={() => onRemoveInvoke(params.row as StockCard)}/>,
        <GridActionsCellItem
          showInMenu
          icon={<DescriptionOutlined/>}
          label={t("button.generate_report")}
          onClick={() => onGenerateReport(params.row as StockCard)}/>
      ],
    }
  ]
  const { visibleColumns, onVisibilityChange } = useColumnVisibilityModel('stockCardColumns', columns);
  const onGenerateReport = (stockCard: StockCard) => setReport(stockCard)
  const onGenerateReportDismiss = () => setReport(undefined)

  const [state, dispatch] = useReducer(reducer, initialState);
  const onStockCardEditorDismiss = () => dispatch({ type: ActionType.DISMISS })
  const onDataGridRowDoubleClicked = (params: GridRowParams) => {
    onStockCardSelected(params.row as StockCard)
  }

  const onStockCardSelected = (stockCard: StockCard) => {
    dispatch({
      type: ActionType.UPDATE,
      payload: stockCard,
    })
  }

  const pagination = () => {
    return (
      isEnd && items.length > 0 && items.length === limit
        ? <DataGridPaginationController
            canBack={isStart}
            canForward={isEnd}
            onBackward={getPrev}
            onForward={getNext}
            size={limit}
            onPageSizeChanged={onLimitChanged}/>
        : <></>
    )
  }

  const dataGrid = (
    <DataGrid
      components={{
        LoadingOverlay: GridLinearProgress,
        NoRowsOverlay: StockCardDataGridEmptyRows,
        Toolbar: GridToolbar,
        Pagination: pagination
      }}
      rows={items}
      columns={columns}
      density={density}
      columnVisibilityModel={visibleColumns}
      loading={isLoading}
      getRowId={(r) => r.stockCardId}
      onRowDoubleClick={onDataGridRowDoubleClicked}
      onStateChange={(v) => onDensityChanged(v.density.value)}
      onColumnVisibilityModelChange={(newModel) =>
        onVisibilityChange(newModel)
      }/>
  )

  return (
    <Box className={classes.root}>
      <InstantSearch searchClient={Provider} indexName="cards">
        <AdaptiveHeader
          title={t("navigation.stock_cards")}
          actionText={canWrite ? t("button.create_stock_card") : undefined}
          onActionEvent={() => dispatch({ type: ActionType.CREATE })}
          onDrawerTriggered={props.onDrawerToggle}
          onSearchFocusChanged={setSearchMode}/>
        {canRead
          ? <>
            <Hidden smDown>
              <Box className={classes.wrapper}>
                {searchMode
                  ? <StockCardDataGrid
                    onItemSelect={onDataGridRowDoubleClicked}
                    onRemoveInvoke={onRemoveInvoke}/>
                  : dataGrid
                }
              </Box>
            </Hidden>
            <Hidden smUp>
              {!isLoading
                ? items.length < 1
                  ? <StockCardEmptyState/>
                  : <StockCardList
                    stockCards={items}
                    onItemSelect={onStockCardSelected}
                    onItemRemove={onRemoveInvoke}/>
                : <LinearProgress/>
              }
              <Fab
                color="primary"
                aria-label={t("button.add")}
                onClick={() => dispatch({ type: ActionType.CREATE })}>
                <AddRounded/>
              </Fab>
            </Hidden>
          </>
          : <ErrorNoPermissionState/>
        }
      </InstantSearch>
      <StockCardEditor
        isOpen={state.isOpen}
        isCreate={state.isCreate}
        stockCard={state.stockCard}
        onDismiss={onStockCardEditorDismiss}/>
      <ConfirmationDialog
        isOpen={stockCard !== null}
        title="dialog.stock_card_remove"
        summary="dialog.stock_card_remove_summary"
        onConfirm={onStockCardRemove}
        onDismiss={onRemoveDismiss}/>
      <StockCardReport isOpen={Boolean(report)} stockCard={report} onDismiss={onGenerateReportDismiss}/>
    </Box>
  )
}

type StockCardDataGridProps = HitsProvided<StockCard> & {
  onItemSelect: (params: GridRowParams) => void,
  onRemoveInvoke: (stockCard: StockCard) => void,
}
const StockCardDataGridCore = (props: StockCardDataGridProps) => {
  const { t } = useTranslation();
  const { density, onDensityChanged } = useDensity('stockCardDensity');

  const columns = [
    { field: entityName, headerName: t("field.entity_name"), flex: 1 },
    { field: assetStockNumber, headerName: t("field.stock_number"), flex: 1 },
    { field: assetDescription, headerName: t("field.description"), flex: 1 },
    { field: unitPrice, headerName: t("field.unit_price"), flex: 1 },
    { field: assetUnitOfMeasure, headerName: t("field.unit_of_measure"), flex: 1 },
    {
      field: "actions",
      type: "actions",
      flex: 0.5,
      getActions: (params: GridRowParams) => [
        <GridActionsCellItem
          icon={<DeleteOutlineRounded/>}
          label={t("button.delete")}
          onClick={() => props.onRemoveInvoke(params.row as StockCard)}/>
      ],
    }
  ];
  const { visibleColumns, onVisibilityChange } = useColumnVisibilityModel('stockCardColumns', columns);

  return (
    <DataGrid
      hideFooterPagination
      components={{
        LoadingOverlay: GridLinearProgress,
        NoRowsOverlay: StockCardEmptyState,
        Toolbar: GridToolbar
      }}
      columns={columns}
      rows={props.hits}
      density={density}
      columnVisibilityModel={visibleColumns}
      getRowId={(r) => r.stockCardId}
      onRowDoubleClick={props.onItemSelect}
      onStateChange={(v) => onDensityChanged(v.density.value)}
      onColumnVisibilityModelChange={(newModel) =>
        onVisibilityChange(newModel)
      }/>
  )
}
const StockCardDataGrid = connectHits<StockCardDataGridProps, StockCard>(StockCardDataGridCore);

const StockCardEmptyState = () => {
  const { t } = useTranslation();

  return (
    <EmptyStateComponent
      icon={LocalAtmOutlined}
      title={t("empty.stock_card_header")}
      subtitle={t("empty.stock_card_summary")}/>
  )
}

const StockCardDataGridEmptyRows = () => {
  return (
    <GridEmptyRow>
      <StockCardEmptyState/>
    </GridEmptyRow>
  )
}

export default StockCardScreen;