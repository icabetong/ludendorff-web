import React from "react";
import { useTranslation } from "react-i18next";
import { LocalAtmOutlined } from "@mui/icons-material";
import EmptyStateComponent from "../state/EmptyStates";
import { GridEmptyRows } from "../../components/datagrid/GridEmptyRows";

const StockCardEmptyState = () => {
  const { t } = useTranslation();

  return (
    <EmptyStateComponent
      icon={LocalAtmOutlined}
      title={t("empty.stock_card_header")}
      subtitle={t("empty.stock_card_summary")}/>
  )
}

const StockCardDataGridEmptyState = () => {
  return (
    <GridEmptyRows>
      <StockCardEmptyState/>
    </GridEmptyRows>
  )
}

export { StockCardEmptyState, StockCardDataGridEmptyState }