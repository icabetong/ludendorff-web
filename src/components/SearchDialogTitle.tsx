import React from "react";
import { useTranslation } from "react-i18next";
import { Stack, IconButton, Typography, Box, Collapse } from "@mui/material";
import { CloseRounded, SearchRounded } from "@mui/icons-material";
import { SearchBoxInputBase } from "./Search";

type CustomDialogTitleProps = {
  children: React.ReactNode,
  hasSearchFocus: boolean,
  onSearchFocusChanged: (hasFocus: boolean) => void,
}
const SearchDialogTitle = (props: CustomDialogTitleProps) => {
  const { t } = useTranslation();
  const { children, hasSearchFocus, onSearchFocusChanged, ...other } = props;

  return (
    <Box sx={{ paddingBottom: hasSearchFocus ? 2 : 0 }}>
      <Stack direction="row" alignItems="center" justifyContent="center" sx={{ px: 2, py: 1 }} {...other}>
        <Typography sx={{flex: 2}} variant="h6">{children}</Typography>
        <IconButton
          edge="end"
          size="large"
          aria-label={t("button.search")}
          onClick={() => onSearchFocusChanged(!hasSearchFocus)}>
          {hasSearchFocus ?  <CloseRounded/> : <SearchRounded/>}
        </IconButton>
      </Stack>
      <Collapse in={hasSearchFocus}>
        <SearchBoxInputBase dontWatchFocus onFocusChanged={onSearchFocusChanged}/>
      </Collapse>
    </Box>
  );
}

export default SearchDialogTitle;