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
    specification: [string, string],
    onSubmit: (spec: [string, string], exists: boolean) => void,
    onCancel: () => void,
    onSpecificationChanged: (spec: [string, string]) => void
}

const SpecificationEditor = (props: SpecificationEditorProps) => {
    const { t } = useTranslation();
    const classes = useStyles();
    const isUpdate = props.specification[0] !== '';

    const onPreSubmit = () => {
        let specification: [string, string] = props.specification;
        props.onSubmit(specification, isUpdate);
    }

    const onKeyChanged = (event: React.ChangeEvent<HTMLInputElement>) => {
        let specification: [string, string] = [event.target.value, props.specification[1]];
        props.onSpecificationChanged(specification);
    }

    const onValueChanged = (event: React.ChangeEvent<HTMLInputElement>) => {
        let specification: [string, string] = [props.specification[0], event.target.value];
        props.onSpecificationChanged(specification);
    }

    return (
        <Dialog
            fullWidth={true}
            maxWidth="xs"
            open={props.isOpen}
            onClose={() => props.onCancel()}>
            <DialogTitle>
                { t(isUpdate 
                    ? "specification_update" 
                    : "specification_create") 
                }
            </DialogTitle>
            <DialogContent dividers={true}>
                <Container disableGutters>
                    <TextField
                        autoFocus
                        id="editor-specification-key"
                        type="text"
                        label={ t("specification_key") }
                        value={props.specification[0]}
                        onChange={onKeyChanged}
                        className={classes.textField}/>
                    <TextField
                        id="editor-specification-value"
                        type="text"
                        label={ t("specification_value") }
                        value={props.specification[1]}
                        onChange={onValueChanged}
                        className={classes.textField}/>
                </Container>
            </DialogContent>

            <DialogActions>
                <Button color="primary" onClick={() => props.onCancel()}>{ t("cancel") }</Button>
                <Button color="primary" onClick={() => onPreSubmit()}>{ t("save") }</Button>
            </DialogActions>
        </Dialog>
    )
}

export default SpecificationEditor;