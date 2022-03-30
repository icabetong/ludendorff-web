import { useTranslation } from "react-i18next";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import LinearProgress from "@mui/material/LinearProgress";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";
import makeStyles from '@mui/styles/makeStyles';
import { PeopleOutlineRounded } from "@mui/icons-material";

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
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
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