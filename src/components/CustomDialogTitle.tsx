import React from "react";
import { useTranslation } from "react-i18next";
import { IconButton, Typography, Theme } from "@mui/material";
import { WithStyles } from '@mui/styles';
import createStyles from '@mui/styles/createStyles';
import withStyles from '@mui/styles/withStyles';
import MuiDialogTitle from "@mui/material/DialogTitle";
import { SearchOutlined } from "@mui/icons-material";

const styles = (theme: Theme) =>
  createStyles({
    root: {
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      margin: 0,
      padding: theme.spacing(2),
    },
    header: {
      flex: 2
    },
  });

type CustomDialogTitleProps = WithStyles<typeof styles> & {
  children: React.ReactNode,
  onSearch: () => void,
}
const CustomDialogTitle = withStyles(styles)((props: CustomDialogTitleProps) => {
  const { t } = useTranslation();
  const { children, classes, onSearch, ...other } = props;
  return (
    <MuiDialogTitle className={ classes.root } { ...other }>
      <Typography className={classes.header} variant="h6">{ children }</Typography>
      { onSearch ? (
        <IconButton
          size="large"
          aria-label={ t("button.search") }
          onClick={ onSearch }>
          <SearchOutlined/>
        </IconButton>
      ) : null }
    </MuiDialogTitle>
  );
})

export default CustomDialogTitle;