import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";
import useMediaQuery from "@material-ui/core/useMediaQuery";
import { makeStyles, useTheme } from "@material-ui/core/styles";

import { User } from "../user/User";

type UserEditorComponentPropsType = {
    isOpen: boolean,
    onCancel: () => void,
    onSubmit: (user: User) => void,
    user?: User
}

const UserEditorComponent = (props: UserEditorComponentPropsType) => {
    const { t } = useTranslation();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('xs'));
    const isUpdate = props.user !== undefined;

}