import React from "react";
import {
  GridToolbarColumnsButton,
  GridToolbarContainer,
  GridToolbarDensitySelector, GridToolbarFilterButton,
  useGridRootProps
} from "@mui/x-data-grid";

type ImporterGridToolbarProps = {
  actions: React.ReactNode[] | React.ReactNode
}
export const ImporterGridToolbar = () => {
  const props = useGridRootProps().componentsProps;

  return (
     <GridToolbarContainer>
       { props && props.toolbar &&
         (props.toolbar as ImporterGridToolbarProps).actions &&
         props.toolbar.actions
       }
       <GridToolbarColumnsButton/>
       <GridToolbarDensitySelector/>
       <GridToolbarFilterButton/>
     </GridToolbarContainer>
  )
}