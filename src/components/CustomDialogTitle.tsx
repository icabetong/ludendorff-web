import React from "react";
import { useTranslation } from "react-i18next";
import {
  Typography,
  createStyles,
  Theme,
  withStyles,
  WithStyles
} from "@material-ui/core";
import MuiDialogTitle from "@material-ui/core/DialogTitle";
import { SearchIcon } from "@heroicons/react/outline";
import HeroIconButton from "./HeroIconButton";

const styles = (theme: Theme) =>
  createStyles({
    root: {
      margin: 0,
      padding: theme.spacing(2),
    },
    actionButton: {
      position: 'absolute',
      right: theme.spacing(1),
      top: theme.spacing(1),
      color: theme.palette.grey[500],
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
    <MuiDialogTitle disableTypography className={classes.root} {...other}>
      <Typography variant="h6">{children}</Typography>
      {onSearch ? (
        <HeroIconButton
          aria-label={t("button.search")}
          icon={SearchIcon}
          className={classes.actionButton}
          onClick={onSearch} />
      ) : null}
    </MuiDialogTitle>
  )
})

export default CustomDialogTitle;