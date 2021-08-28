import { useState } from "react";
import { useTranslation } from "react-i18next";
import Button from "@material-ui/core/Button";
import Container from "@material-ui/core/Container";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";
import TextField from "@material-ui/core/TextField";
import { makeStyles } from "@material-ui/core/styles";
import React from "react";

const useStyles = makeStyles(() => ({
    textField: {
        margin: '0.6em 0',
        width: '100%'
    }
}));

type SpecificationEditorProps = {
    isOpen: boolean,
    specification?: [string, string],
    onSubmit: () => void,
    onCancel: () => void,
    onKeyChanged: (key: string) => void,
    onValueChanged: (value: string) => void
}

const SpecificationEditor = (props: SpecificationEditorProps) => {
    const { t } = useTranslation();
    const classes = useStyles();
    const [keyError, setKeyError] = useState(false);
    const [valueError, setValueError] = useState(false);
    const specification = props.specification === undefined ? ['', ''] : props.specification;

    const onPreSubmit = () => {
        if (specification[0] === '') {
            setKeyError(true);
            return;
        }

        if (specification[1] === '') {
            setValueError(true);
            return;
        }

        props.onSubmit();
    }

    return (
        <Dialog
            fullWidth={true}
            maxWidth="xs"
            open={props.isOpen}
            onClose={() => props.onCancel()}>
            <DialogTitle>{ t("specification_details") }</DialogTitle>
            <DialogContent dividers={true}>
                <Container disableGutters>
                    <TextField
                        autoFocus
                        id="editor-specification-key"
                        type="text"
                        label={ t("field.specification_key") }
                        value={specification[0]}
                        error={keyError}
                        helperText={keyError ? t("error.empty_specification_key") : undefined}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                            let key = e.target.value;
                            if (key !== '' && keyError)
                                setKeyError(false);
                            return props.onKeyChanged(key); 
                        }}
                        className={classes.textField}/>
                    <TextField
                        id="editor-specification-value"
                        type="text"
                        label={ t("field.specification_value") }
                        value={specification[1]}
                        error={valueError}
                        helperText={valueError ? t("error.empty_specification_value") : undefined}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                            let value = e.target.value;
                            if (value !== '' && valueError)
                                setValueError(false);
                            return props.onValueChanged(value);
                        }}
                        className={classes.textField}/>
                </Container>
            </DialogContent>

            <DialogActions>
                <Button color="primary" onClick={() => props.onCancel()}>{ t("button.cancel") }</Button>
                <Button color="primary" onClick={() => onPreSubmit()}>{ t("button.save") }</Button>
            </DialogActions>
        </Dialog>
    )
}

export default SpecificationEditor;