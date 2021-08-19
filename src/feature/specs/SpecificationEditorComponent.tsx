import { useTranslation } from "react-i18next";
import Button from "@material-ui/core/Button";
import Container from "@material-ui/core/Container";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";
import TextField from "@material-ui/core/TextField";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles(() => ({
    textField: {
        margin: '0.6em 0',
        width: '100%'
    }
}));

type SpecEditorComponentPropsType = {
    isOpen: boolean,
    onSubmit: (spec: [string, string], exists: boolean) => void,
    onCancel: () => void,
    specKey: string,
    specValue: string
    onSpecKeyChanged: (key: string) => void,
    onSpecValueChanged: (value: string) => void,
}

const SpecificationEditorComponent = (props: SpecEditorComponentPropsType) => {
    const { t } = useTranslation();
    const classes = useStyles();
    const isInUpdateMode = Boolean(props.specKey);

    const onPreSubmit = () => {
        let specification: [string, string] = [props.specKey, props.specValue];
        props.onSubmit(specification, isInUpdateMode);
    }

    return (
        <Dialog
            fullWidth={true}
            maxWidth="xs"
            open={props.isOpen}
            onClose={() => props.onCancel()}>
            <DialogTitle>
                { t(isInUpdateMode 
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
                        value={props.specKey}
                        variant="outlined"
                        size="small"
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => props.onSpecKeyChanged(e.target.value)}
                        className={classes.textField}/>
                    <TextField
                        id="editor-specification-value"
                        type="text"
                        label={ t("specification_value") }
                        value={props.specValue}
                        variant="outlined"
                        size="small"
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => props.onSpecValueChanged(e.target.value)}
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

export default SpecificationEditorComponent