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
    const specification = props.specification === undefined ? ['', ''] : props.specification;

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
                        label={ t("specification_key") }
                        value={specification[0]}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            props.onKeyChanged(e.target.value)
                        }
                        className={classes.textField}/>
                    <TextField
                        id="editor-specification-value"
                        type="text"
                        label={ t("specification_value") }
                        value={specification[1]}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                            props.onValueChanged(e.target.value)
                        }
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

export default SpecificationEditor;