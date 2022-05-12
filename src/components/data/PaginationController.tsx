import { Box, IconButton } from "@mui/material";
import {  ChevronLeftRounded, ChevronRightRounded } from "@mui/icons-material";

export type PaginationControllerProps = {
  canBack: boolean,
  canForward: boolean,
  onBackward: () => void,
  onForward: () => void,
}

export const PaginationController = (props: PaginationControllerProps) => {
  const { canBack, canForward, onBackward, onForward } = props;

  return (
    <Box
      sx={{ display: 'flex', width: '100%', alignItems: 'center', justifyContent: 'center', flexDirection: 'row' }}>
      <IconButton onClick={onBackward} disabled={canBack}>
        <ChevronLeftRounded/>
      </IconButton>
      <IconButton onClick={onForward} disabled={canForward}>
        <ChevronRightRounded/>
      </IconButton>
    </Box>
  )
}

