import { GridOverlay } from "@mui/x-data-grid";
import LinearProgress from "@mui/material/LinearProgress";

const GridLinearProgress = () => {
  return (
    <GridOverlay>
      <div style={{ position: 'absolute', top: 0, width: '100%' }}>
        <LinearProgress/>
      </div>
    </GridOverlay>
  )
}

export default GridLinearProgress;