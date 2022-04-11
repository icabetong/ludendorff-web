import React from "react";
import { useTranslation } from "react-i18next";
import { Stack, IconButton, Typography } from "@mui/material";
import { SearchOutlined } from "@mui/icons-material";

type CustomDialogTitleProps = {
  children: React.ReactNode,
  onSearch: () => void,
}
const CustomDialogTitle = (props: CustomDialogTitleProps) => {
  const { t } = useTranslation();
  const { children, onSearch, ...other } = props;
  return (
    <Stack direction="row" alignItems="center" justifyContent="center" sx={{ px: 2, py: 1 }} {...other}>
      <Typography sx={{flex: 2}} variant="h6">{children}</Typography>
      {onSearch ? (
        <IconButton
          edge="end"
          size="large"
          aria-label={t("button.search")}
          onClick={onSearch}>
          <SearchOutlined/>
        </IconButton>
      ) : null}
    </Stack>
  );
}

export default CustomDialogTitle;