import { Box, Chip, Grow, IconButton, Stack, Typography } from "@mui/material";
import { CheckRounded, ChevronLeftRounded, ChevronRightRounded } from "@mui/icons-material";
import { useTranslation } from "react-i18next";

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

export type DataGridPaginationControllerProps = PaginationControllerProps & {
  size: number,
  onPageSizeChanged: (size: number) => void,
}

export const DataGridPaginationController = (props: DataGridPaginationControllerProps) => {
  const { t } = useTranslation();
  const sizes = [15, 25, 50];
  const { size, canBack, canForward, onBackward, onForward, onPageSizeChanged } = props;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
      <Typography variant="body2" mr={2}>{t("field.rows_per_page")}</Typography>
      <Stack direction="row" spacing={1}>
        {sizes.map((s) => {
          return (
            s === size
              ? <Grow key={s} in={s === size}>
                <Chip
                  variant="outlined"
                  label={s}
                  color={size === s ? "primary" : undefined}
                  icon={size === s ? <CheckRounded/> : undefined}
                  onClick={() => onPageSizeChanged(s)}/>
              </Grow>
              : <Chip
                key={s}
                variant="outlined"
                label={s}
                color={size === s ? "primary" : undefined}
                icon={size === s ? <CheckRounded/> : undefined}
                onClick={() => onPageSizeChanged(s)}/>
          )
        })}
      </Stack>
      <IconButton onClick={onBackward} disabled={canBack}>
        <ChevronLeftRounded/>
      </IconButton>
      <IconButton onClick={onForward} disabled={canForward}>
        <ChevronRightRounded/>
      </IconButton>
    </Box>
  )
}