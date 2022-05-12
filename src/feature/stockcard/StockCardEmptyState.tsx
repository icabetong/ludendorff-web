import React from "react";
import { useTranslation } from "react-i18next";
import { LocalAtmOutlined } from "@mui/icons-material";
import EmptyStateComponent from "../state/EmptyStates";
import { GridEmptyRow } from "../../components";

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