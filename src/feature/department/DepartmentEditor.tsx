import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import Button from "@material-ui/core/Button";
import Container from "@material-ui/core/Container";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";
import FormControl from "@material-ui/core/FormControl";
import FormLabel from "@material-ui/core/FormLabel";
import ListItem from "@material-ui/core/ListItem";
import TextField from "@material-ui/core/TextField";
import Typography from "@material-ui/core/Typography";
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
    onManagerSelect: () => void,
    onNameChanged: (name: string) => void,
}

const DepartmentEditor = (props: DepartmentEditorProps) => {
    const { t } = useTranslation();
    const classes = useStyles();
    const [nameError, setNameError] = useState(false);

    const onNameChanged = (event: React.ChangeEvent<HTMLInputElement>) => {
        let name = event.target.value;
        if (name !== '' && nameError)
            setNameError(false);

        props.onNameChanged(name);
    }

    const onPreSubmit = () => {
        if (props.name === '') {
            setNameError(true);
            return;
        }

        props.onSubmit()
    }

    return (
        <Dialog
            fullWidth={true}
            maxWidth="xs"
            open={props.isOpen}
            onClose={props.onCancel}>
            <DialogTitle>{ t("department_details") }</DialogTitle>
            <DialogContent>
                <Container disableGutters>
                    <TextField
                        autoFocus
                        id="editor-department-name"
                        type="text"
                        label={ t("field.department_name") }
                        value={props.name === undefined ? '' : props.name}
                        error={nameError}
                        helperText={nameError ? t("feedback.empty_department_name") : undefined }
                        onChange={onNameChanged}
                        className={classes.textField}/>
                    <FormControl component="fieldset" className={classes.textField}>
                            <FormLabel component="legend">
                                <Typography variant="body2">{ t("field.manager") }</Typography>
                            </FormLabel>
                            <ListItem button onClick={props.onManagerSelect}>
                                <Typography variant="body2">
                                    { props.manager?.name !== undefined ? props.manager?.name : t("not_set")  }
                                </Typography>
                            </ListItem>
                        </FormControl>
                </Container>
            </DialogContent>
            <DialogActions>
                <Button color="primary" onClick={props.onCancel}>{ t("button.cancel") }</Button>
                <Button color="primary" onClick={onPreSubmit}>{ t("button.save") }</Button>
            </DialogActions>
        </Dialog>
    )
}

export default DepartmentEditor;