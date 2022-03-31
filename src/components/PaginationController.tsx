import {
  Box,
  Chip,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography
} from "@mui/material";
import {CheckRounded, ChevronLeftRounded, ChevronRightRounded} from "@mui/icons-material";
import {useTranslation} from "react-i18next";
import {useState} from "react";


type PaginationControllerType = {
  size: number,
  canBack: boolean,
  canForward: boolean,
  onBackward: () => void,
  onForward: () => void,
  onPageSizeChanged: (size: number) => void,
}

const PaginationController = (props: PaginationControllerType) => {
  const { t } = useTranslation();
  const sizes = [15, 25, 50];
  const { size, canBack, canForward, onBackward, onForward, onPageSizeChanged } = props;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
      <Typography variant="body2" mr={2}>{t("field.rows_per_page")}</Typography>
      <Stack direction="row" spacing={1}>
        {sizes.map((s) => {
          return (
            <Chip
              key={s}
              variant="outlined"
              label={s}
              color={size === s ? "primary" : undefined}
              icon={size === s ? <CheckRounded/> : undefined }
              onClick={() => onPageSizeChanged(s) }/>
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

export default PaginationController;