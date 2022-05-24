import { IconButton, Stack } from "@mui/material";
import { ChevronLeftRounded, ChevronRightRounded } from "@mui/icons-material";
import { PaginationControllerProps } from "../data/PaginationController";

export type GridPaginationControllerProps = PaginationControllerProps;

export const GridPaginationController = (props: GridPaginationControllerProps) => {
  const { canBack, canForward, onBackward, onForward } = props;

  return (
    <Stack direction="row" alignItems="center" justifyContent="center">
      <IconButton onClick={onBackward} disabled={canBack}>
        <ChevronLeftRounded/>
      </IconButton>
      <IconButton onClick={onForward} disabled={canForward}>
        <ChevronRightRounded/>
      </IconButton>
    </Stack>
  )
}