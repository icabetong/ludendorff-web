import { Box } from "@material-ui/core";
import {
  GridToolbarContainer,
  GridToolbarColumnsButton,
  GridToolbarDensitySelector,
  useGridSlotComponentProps
} from "@material-ui/data-grid";

type GridComponentProps = {
  destinations?: JSX.Element[]
}

const GridToolbar = () => {
  const { apiRef } = useGridSlotComponentProps();
  const componentProps = apiRef.current.componentsProps;

  return (
    <GridToolbarContainer>
      <Box>
        <GridToolbarColumnsButton/>
        <GridToolbarDensitySelector/>
        { componentProps && componentProps.toolbar &&
          (componentProps.toolbar as GridComponentProps).destinations &&
          (componentProps.toolbar as GridComponentProps).destinations
        }
      </Box>
    </GridToolbarContainer>
  );
}

export default GridToolbar;