import { useTranslation } from "react-i18next";
import EmptyStateComponent from "../state/EmptyStates";
import { LocalAtmOutlined } from "@mui/icons-material";
import GridEmptyRow from "../../components/GridEmptyRows";
import React from "react";

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
    <GridEmptyRow>
      <StockCardEmptyState/>
    </GridEmptyRow>
  )
}

export { StockCardEmptyState, StockCardDataGridEmptyState }