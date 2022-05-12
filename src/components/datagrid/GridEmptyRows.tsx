import { GridOverlay } from "@mui/x-data-grid";
import React from "react";

type GridEmptyRowsProps = {
  children?: JSX.Element | React.ReactNode
}

export const GridEmptyRow = (props: GridEmptyRowsProps) => {
  return (
    <GridOverlay>
      {props.children}
    </GridOverlay>
  )
}