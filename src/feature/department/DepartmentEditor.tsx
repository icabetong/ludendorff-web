import React from "react";
import { useTranslation } from "react-i18next";
import Button from "@material-ui/core/Button";
import Container from "@material-ui/core/Container";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";
import TextField from "@material-ui/core/TextField";
import { makeStyles } from "@material-ui/core/styles";

import { UserCore } from "../user/User";

const useStyles = makeStyles(() => ({
    textField: {
        margin: '0.6em 0',
        width: '100%'
    }
}));

type DepartmentEditorProps = {
    isOpen: boolean,
    name?: string,
    manager?: UserCore
    onSubmit: () => void,
    onCancel: () => void,
    onNameChanged: (name: string) => void,
}

const DepartmentEditor = (props: DepartmentEditorProps) => {
    const { t } = useTranslation();
    const classes = useStyles();

    return (
        <Dialog
            fullWidth={true}
            maxWidth="xs"
            open={props.isOpen}
            onClose={() => props.onCancel() }>
            <DialogTitle>{ t("department_details") }</DialogTitle>
            <DialogContent dividers={true}>
                <Container disableGutters>
                    <TextField
                        autoFocus
                        id="editor-department-name"
                        type="text"
                        label={ t("department_name") }
                        value={props.name === undefined ? '' : props.name}
                        onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                            props.onNameChanged(event.target.value)
                        }}
                        className={classes.textField}/>
                </Container>
            </DialogContent>
            <DialogActions>
                <Button color="primary" onClick={() => props.onCancel()}>{ t("cancel") }</Button>
                <Button color="primary" onClick={() => props.onSubmit()}>{ t("save") }</Button>
            </DialogActions>
        </Dialog>
    )
}

export default DepartmentEditor;