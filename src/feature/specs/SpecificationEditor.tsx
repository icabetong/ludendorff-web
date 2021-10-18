import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import {
    Button,
    Container, 
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    TextField,
    makeStyles
} from "@material-ui/core";

const useStyles = makeStyles(() => ({
    textField: {
        margin: '0.6em 0',
        width: '100%'
    }
}));

export type FormValues = {
    key: string,
    value: string
}

type SpecificationEditorProps = {
    isOpen: boolean,
    isCreate: boolean,
    specification?: [string, string],
    onSubmit: (data: FormValues) => void,
    onCancel: () => void,
}

export const SpecificationEditor = (props: SpecificationEditorProps) => {
    const { t } = useTranslation();
    const { register, handleSubmit, formState: { errors } } = useForm();
    const classes = useStyles();
    const specification = props.specification === undefined ? ['', ''] : props.specification;

    return (
        <Dialog
            fullWidth={true}
            maxWidth="xs"
            open={props.isOpen}
            onClose={() => props.onCancel()}>
            <form onSubmit={handleSubmit(props.onSubmit)}>
                <DialogTitle>{ t("specification_details") }</DialogTitle>
                <DialogContent>
                    <Container disableGutters>
                        <TextField
                            autoFocus
                            id="key"
                            type="text"
                            label={ t("field.specification_key") }
                            defaultValue={specification[0]}
                            error={errors.key !== undefined}
                            helperText={errors.key && t(errors.key.message)}
                            className={classes.textField}
                            {...register("key", { required: "feedback.empty_specification_key" })}/>
                        <TextField
                            id="value"
                            type="text"
                            label={ t("field.specification_value") }
                            defaultValue={specification[1]}
                            error={errors.value !== undefined}
                            helperText={errors.value && t(errors.value.message)}
                            className={classes.textField}
                            {...register("value", { required: "feedback.empty_specification_value" })}/>
                    </Container>
                </DialogContent>

                <DialogActions>
                    <Button color="primary" onClick={props.onCancel}>{ t("button.cancel") }</Button>
                    <Button color="primary" type="submit">{ t("button.save") }</Button>
                </DialogActions>
            </form>
        </Dialog>
    )
}