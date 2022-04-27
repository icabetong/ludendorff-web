import React, { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { LazyLoadImage } from "react-lazy-load-image-component";
import {
  Box, Button, Dialog, DialogActions, DialogContent, DialogContentText,
  DialogTitle,
  Grid,
  LinearProgress, ListItemIcon, ListItemText,
  MenuItem,
  Stack,
  Typography,
  useMediaQuery,
  useTheme
} from "@mui/material";
import { EditOutlined, ImageOutlined, LockOutlined, LogoutRounded, SendOutlined, } from "@mui/icons-material";
import ProfileInfoList from "./ProfileInfoList";
import ProfileActionList from "./ProfileActionList";
import ChangeNamePrompt from "./actions/ChangeName";
import ChangePasswordPrompt from "./actions/ChangePassword";
import RequestResetPrompt from "./actions/RequestReset";
import { AuthStatus, useAuthState } from "../auth/AuthProvider";
import { ReactComponent as Avatar } from "../../shared/user.svg"
import AdaptiveHeader from "../../components/AdaptiveHeader";
import { auth } from "../../index";

type ProfileScreenProps = {
  onDrawerToggle: () => void
}

const ProfileScreen = (props: ProfileScreenProps) => {
  const { status, user } = useAuthState();
  const { t } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const fileInput = useRef<HTMLInputElement | null>(null);

  const [onSignOut, setSignOut] = useState(false);
  const onSignOutInvoke = () => setSignOut(true);
  const onSignOutDismiss = () => setSignOut(false);
  const onEndSession = async () => {
    await auth.signOut();
  }

  const [changeName, setChangeName] = useState(false);
  const onChangeNameInvoke = () => setChangeName(true);
  const onChangeNameDismiss = () => setChangeName(false);

  const [changePassword, setChangePassword] = useState(false);
  const onChangePasswordInvoke = () => setChangePassword(true);
  const onChangePasswordDismiss = () => setChangePassword(false);

  const [requestReset, setRequestReset] = useState(false);
  const onResetPasswordInvoke = () => setRequestReset(true);
  const onResetPasswordDismiss = () => setRequestReset(false);

  const actions = [
    {
      key: 'action:avatar',
      icon: ImageOutlined,
      title: "action.update_avatar",
      action: () => fileInput?.current?.click()
    },
    { key: 'action:name', icon: EditOutlined, title: "action.change_name", action: onChangeNameInvoke },
    { key: 'action:password', icon: LockOutlined, title: "action.change_password", action: onChangePasswordInvoke },
    { key: 'action:request', icon: SendOutlined, title: "action.request_reset", action: onResetPasswordInvoke }
  ];

  return (
    <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column' }}>
      <AdaptiveHeader
        title={t("navigation.profile")}
        menuItems={[
          <MenuItem key={0} onClick={onSignOutInvoke}>
            <ListItemIcon><LogoutRounded/></ListItemIcon>
            <ListItemText>{t("button.sign_out")}</ListItemText>
          </MenuItem>
        ]}
        onDrawerTriggered={props.onDrawerToggle}/>
      <input
        ref={fileInput}
        type="file"
        accept="image/*"
        hidden/>

      {status === AuthStatus.FETCHED
        ?
        <Box sx={{ flex: 1, padding: 2 }}>
          <Grid
            container
            direction={isMobile ? "column" : "row"}
            alignItems="center"
            justifyContent="center"
            spacing={2}>
            <Grid
              container
              direction="row"
              item
              sm={6}
              alignItems="center"
              justifyContent="center">
              <Grid
                container
                item
                alignItems="center"
                justifyContent="center">
                {user?.imageUrl
                  ? <Box
                      component={LazyLoadImage}
                      sx={{
                        width: '20em',
                        height: '20em',
                        borderRadius: '50%'
                      }}
                      alt={t("info.profile_image")}
                      src={user?.imageUrl}/>
                  : <Box
                      component={Avatar}
                      sx={{
                        width: '20em',
                        height: '20em',
                        borderRadius: '50%'
                      }}/>
                }
              </Grid>
              <Grid
                container
                item
                alignItems="center"
                justifyContent="center">
                <Typography
                  align="center"
                  variant="h5">
                  {t("template.full_name", { first: user?.firstName, last: user?.lastName })}
                </Typography>
              </Grid>
              <Grid
                container
                item
                alignItems="center"
                justifyContent="center">
                <Typography
                  align="center"
                  variant="body1">{user?.email}</Typography>
              </Grid>
            </Grid>
            <Grid
              container
              item
              sm={6}
              alignItems="center"
              justifyContent="flex-start">
              <Stack direction="column">
                <ProfileInfoList user={user}/>
                <ProfileActionList actions={actions}/>
              </Stack>
            </Grid>
          </Grid>
        </Box>
        : <LinearProgress/>
      }
      <ChangeNamePrompt
        isOpen={changeName}
        onDismiss={onChangeNameDismiss}/>
      <ChangePasswordPrompt
        isOpen={changePassword}
        onDismiss={onChangePasswordDismiss}/>
      <RequestResetPrompt
        isOpen={requestReset}
        onDismiss={onResetPasswordDismiss}/>
      <Dialog
        open={onSignOut}
        fullWidth={true}
        maxWidth="xs">
        <DialogTitle>{t("dialog.sign_out")}</DialogTitle>
        <DialogContent>
          <DialogContentText>{t("dialog.sign_out_message")}</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            color="primary"
            onClick={onSignOutDismiss}>{t("button.cancel")}</Button>
          <Button
            color="primary"
            onClick={onEndSession}>{t("button.continue")}</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default ProfileScreen;