import { Box } from "@mui/material";
import {
  GridToolbarColumnsButton,
  GridToolbarContainer,
  GridToolbarDensitySelector,
  useGridRootProps
} from "@mui/x-data-grid";

type GridComponentProps = {
  destinations?: JSX.Element[],
  endAction: JSX.Element,
  isSearchEnabled?: boolean,
  onSearchFocusChanged: (focus: boolean) => void,
}

const GridToolbar = () => {
  const props = useGridRootProps().componentsProps

  return (
    <GridToolbarContainer>
      <Box flexGrow={8}>
        <GridToolbarColumnsButton/>
        <GridToolbarDensitySelector/>
        {props && props.toolbar &&
          (props.toolbar as GridComponentProps).destinations &&
          (props.toolbar as GridComponentProps).destinations
        }
      </Box>
      <Box sx={{ mx: 2 }}>
        {props && props.toolbar &&
          (props.toolbar as GridComponentProps).endAction &&
          (props.toolbar as GridComponentProps).endAction
        }
      </Box>
    </GridToolbarContainer>
  );
}

export default GridToolbar;