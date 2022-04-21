import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Controller, useForm } from "react-hook-form";
import {
  Alert,
  Button,
  Checkbox,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Fade,
  FormControl,
  FormControlLabel,
  FormGroup,
  FormLabel,
  Grid,
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { useSnackbar } from "notistack";
import { Permission, User, UserRepository } from "./User";
import { isDev, newId } from "../../shared/utils";

type UserEditorProps = {
  isOpen: boolean,
  isCreate: boolean,
  user: User | undefined,
  onDismiss: () => void,
}

type FormValues = {
  lastName: string,
  firstName: string,
  email: string,
  position: string,
  permissionRead: boolean,
  permissionWrite: boolean,
  permissionDelete: boolean,
  permissionManageUsers: boolean,
  permissionAdmin: boolean
}

const UserEditor = (props: UserEditorProps) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const { enqueueSnackbar } = useSnackbar();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { register, handleSubmit, formState: { errors }, control, reset, watch } = useForm<FormValues>();
  const [isWritePending, setWritePending] = useState<boolean>(false);
  const isAdminChecked = watch('permissionAdmin');

  useEffect(() => {
    const hasPermission = (permission: Permission) => {
      return props.user?.permissions.includes(permission);
    }

    if (props.isOpen) {
      reset({
        lastName: props.user?.lastName,
        firstName: props.user?.firstName,
        email: props.user?.email,
        position: props.user?.position,
        permissionRead: props.user ? hasPermission(Permission.READ) : false,
        permissionWrite: props.user ? hasPermission(Permission.WRITE) : false,
        permissionDelete: props.user ? hasPermission(Permission.DELETE) : false,
        permissionManageUsers: props.user ? hasPermission(Permission.MANAGE_USERS) : false,
        permissionAdmin: props.user ? hasPermission(Permission.ADMINISTRATIVE) : false
      })
    }
  }, [props.isOpen, props.user, reset])

  const onDismiss = () => {
    reset();
    setWritePending(false);
    props.onDismiss();
  }

  const onSubmit = (data: FormValues) => {
    setWritePending(true);

    let permissions: number[] = [];
    if (data.permissionRead) permissions.push(Permission.READ)
    if (data.permissionWrite) permissions.push(Permission.WRITE)
    if (data.permissionDelete) permissions.push(Permission.DELETE)
    if (data.permissionManageUsers) permissions.push(Permission.MANAGE_USERS)
    if (data.permissionAdmin) permissions.push(Permission.ADMINISTRATIVE)
    console.log(permissions)

    if (props.user?.permissions) {
      const current = permissions;
      permissions = [...props.user?.permissions, ...current];
      permissions = permissions.filter((item, index) => permissions.indexOf(item) === index);
    }

    const user: User = {
      userId: props.user !== undefined ? props.user?.userId : newId(),
      disabled: props.user !== undefined ? props.user?.disabled : false,
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      position: data.position,
      permissions: permissions,
      setupCompleted: props.user !== undefined ? props.user?.setupCompleted : false,
    }

    if (props.isCreate) {
      UserRepository.create(user)
        .then(() => enqueueSnackbar(t("feedback.user_created")))
        .catch((error) => {
          enqueueSnackbar(t("feedback.user_create_error"));
          if (isDev) console.log(error)
        })
        .finally(onDismiss)
    } else {
      UserRepository.update(user)
        .then(() => enqueueSnackbar(t("feedback.user_updated")))
        .catch((error) => {
          enqueueSnackbar(t("feedback.user_update_error"))
          if (isDev) console.log(error)
        })
        .finally(onDismiss)
    }
  }

  return (
    <Dialog
      fullScreen={isMobile}
      fullWidth={true}
      maxWidth={isMobile ? "xs" : "md"}
      open={props.isOpen}
      onClose={onDismiss}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogTitle>{t("dialog.details_user")}</DialogTitle>
        <DialogContent dividers={true}>
          <Container sx={{ py: 1 }}>
            <Grid
              container
              direction={isMobile ? "column" : "row"}
              alignItems="stretch"
              justifyContent="center"
              spacing={isMobile ? 0 : 4}>
              <Grid item xs={6} sx={{ maxWidth: '100%' }}>
                <TextField
                  autoFocus
                  disabled={isWritePending}
                  id="lastName"
                  type="text"
                  label={t("field.last_name")}
                  defaultValue={props.user?.lastName}
                  error={errors.lastName !== undefined}
                  helperText={errors.lastName?.message !== undefined ? t(errors.lastName?.message) : undefined}
                  {...register("lastName", { required: "feedback.empty_last_name" })} />

                <TextField
                  disabled={isWritePending}
                  id="firstName"
                  type="text"
                  label={t("field.first_name")}
                  defaultValue={props.user?.firstName}
                  error={errors.firstName !== undefined}
                  helperText={errors.firstName?.message !== undefined ? t(errors.firstName?.message) : undefined}
                  {...register("firstName", { required: "feedback.empty_first_name" })} />

                <TextField
                  disabled={isWritePending}
                  id="email"
                  type="text"
                  label={t("field.email")}
                  defaultValue={props.user?.email}
                  error={errors.email !== undefined}
                  helperText={errors.email?.message !== undefined ? t(errors.email?.message) : undefined}
                  {...register("email", { required: "feedback.empty_email" })} />

                <TextField
                  disabled={isWritePending}
                  id="position"
                  type="text"
                  label={t("field.position")}
                  defaultValue={props.user?.position}
                  error={errors.position !== undefined}
                  helperText={errors.position?.message !== undefined ? t(errors.position?.message) : undefined}
                  {...register("position", { required: "feedback.empty_position" })} />

              </Grid>
              <Grid item xs={6} sx={{ maxWidth: '100%' }}>
                <FormControl
                  component="fieldset"
                  fullWidth>
                  <FormLabel component="legend">
                    <Typography variant="body2">{t("field.permissions")}</Typography>
                  </FormLabel>
                  <FormGroup>
                    <FormControlLabel
                      label={t("permission.read")}
                      control={
                        <Controller
                          name="permissionRead"
                          control={control}
                          render={({ field: { ref, value, onChange } }) => (
                            <Checkbox
                              checked={value}
                              onChange={onChange}
                              inputRef={ref}
                              disabled={isWritePending}/>
                          )}/>
                      }/>
                    <FormControlLabel
                      label={t("permission.write")}
                      control={
                        <Controller
                          name="permissionWrite"
                          control={control}
                          render={({ field: { ref, value, onChange } }) => (
                            <Checkbox
                              checked={value}
                              onChange={onChange}
                              inputRef={ref}
                              disabled={isWritePending}/>
                          )}/>
                      }/>
                    <FormControlLabel
                      label={t("permission.delete")}
                      control={
                        <Controller
                          name="permissionDelete"
                          control={control}
                          render={({ field: { ref, value, onChange } }) => (
                            <Checkbox
                              checked={value}
                              onChange={onChange}
                              inputRef={ref}
                              disabled={isWritePending}/>
                          )}/>
                      }/>
                    <FormControlLabel
                      label={t("permission.manage_users")}
                      control={
                        <Controller
                          name="permissionManageUsers"
                          control={control}
                          render={({ field: { ref, value, onChange } }) => (
                            <Checkbox
                              checked={value}
                              onChange={onChange}
                              inputRef={ref}
                              disabled={isWritePending}/>
                          )}/>
                      }/>
                    <FormControlLabel
                      label={t("permission.administrative")}
                      control={
                        <Controller
                          name="permissionAdmin"
                          control={control}
                          render={({ field: { ref, value, onChange } }) => (
                            <Checkbox
                              checked={value}
                              onChange={onChange}
                              inputRef={ref}
                              disabled={isWritePending}/>
                          )}/>
                    }/>
                  </FormGroup>
                </FormControl>
                <Fade in={isAdminChecked}>
                  <Alert severity="warning">{t("info.user_editor_admin_permission")}</Alert>
                </Fade>
              </Grid>
            </Grid>
          </Container>
        </DialogContent>
        <DialogActions>
          <Button
            color="primary"
            onClick={onDismiss}
            disabled={isWritePending}>{t("button.cancel")}</Button>
          <Button
            color="primary"
            type="submit"
            disabled={isWritePending}>{t("button.save")}</Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}

export default UserEditor;