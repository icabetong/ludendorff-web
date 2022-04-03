import { GridOverlay } from "@mui/x-data-grid";

type GridEmptyRowsProps = {
  children?: JSX.Element | React.ReactNode
}

const GridEmptyRow = (props: GridEmptyRowsProps) => {
  return (
    <GridOverlay>
      {props.children}
    </GridOverlay>
  )
}

export default GridEmptyRow;