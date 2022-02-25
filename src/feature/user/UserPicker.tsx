import { useTranslation } from "react-i18next";
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";
import LinearProgress from "@material-ui/core/LinearProgress";
import useMediaQuery from "@material-ui/core/useMediaQuery";
import { useTheme, makeStyles } from "@material-ui/core/styles";
import { PeopleOutlineRounded } from "@material-ui/icons";

import { User } from "./User";
import UserList from "./UserList";

import { ErrorNoPermissionState } from "../state/ErrorStates";
import EmptyStateComponent from "../state/EmptyStates";
import { usePermissions } from "../auth/AuthProvider";

const useStyles = makeStyles(() => ({
  root: {
    minHeight: '60vh',
    paddingTop: 0,
    paddingBottom: 0,
    '& .MuiList-padding': {
      padding: 0
    }
  }
}));

type UserPickerProps = {
  isOpen: boolean,
  users: User[],
  isLoading: boolean,
  onDismiss: () => void,
  onSelectItem: (user: User) => void,
}

const UserPicker = (props: UserPickerProps) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('xs'));
  const classes = useStyles();
  const { canRead } = usePermissions();

  const onSelect = (user: User) => {
    props.onSelectItem(user);
    props.onDismiss();
  }

  return (
    <Dialog
      fullScreen={isMobile}
      fullWidth={true}
      maxWidth="xs"
      open={props.isOpen}
      onClose={props.onDismiss}>
      <DialogTitle>{t("user_select")}</DialogTitle>
      <DialogContent dividers={true} className={classes.root}>
        {canRead ?
          !props.isLoading
            ? props.users.length > 0
              ?<UserList
                  users={props.users}
                  onItemSelect={onSelect} />
              : <EmptyStateComponent
                icon={PeopleOutlineRounded}
                title={t("empty_user")}
                subtitle={t("empty_user_summary")} />
            : <LinearProgress />
          : <ErrorNoPermissionState />
        }
      </DialogContent>
      <DialogActions>
        <Button color="primary" onClick={props.onDismiss}>{t("close")}</Button>
      </DialogActions>
    </Dialog>
  );
}

export default UserPicker;