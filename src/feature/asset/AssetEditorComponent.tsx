import React from "react";
import { useTranslation } from "react-i18next";
import Button from "@material-ui/core/Button";
import Container from "@material-ui/core/Container";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";
import FormControl from "@material-ui/core/FormControl";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import FormLabel from "@material-ui/core/FormLabel";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import Radio from "@material-ui/core/Radio";
import RadioGroup from "@material-ui/core/RadioGroup";
import TextField from "@material-ui/core/TextField";
import Typography from "@material-ui/core/Typography";
import useMediaQuery from "@material-ui/core/useMediaQuery";
import { makeStyles, useTheme } from "@material-ui/core/styles";

import PlusIcon from "@heroicons/react/outline/PlusIcon";

import { Asset, Status } from "./Asset";
import { Category } from "../category/Category";
import ListItemContent from "../../components/ListItemContent";

const useStyles = makeStyles((theme) => ({
    textField: {
        width: '100%',
        margin: '0.6em 0'
    },
    icon: {
        width: '1em',
        height: '1em',
        color: theme.palette.text.primary
    }
}));

type AssetEditorComponentPropsType = {
    isOpen: boolean,
    id: string,
    name: string,
    status: Status,
    category?: Category,
    specs: Map<string, string>,
    categories: Category[],
    onCancel: () => void,
    onSubmit: (asset: Asset) => void,
    onViewQrCode: () => void,
    onCategorySelect: () => void,
    onAddSpecification: () => void,
    onSelectSpecification: (specification: [string, string]) => void,
    onNameChanged: (name: string) => void,
    onStatusChanged: (status: Status) => void,
}

const AssetEditorComponent = (props: AssetEditorComponentPropsType) => {
    const { t } = useTranslation();
    const classes = useStyles();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('xs'));
    const isUpdate = props.id !== '';

    const onPreSubmit = () => {

    }

    const onNameChanged = (event: React.ChangeEvent<HTMLInputElement>) => {
        props.onNameChanged(event.target.value);
    }

    const onStatusChanged = (event: React.ChangeEvent<HTMLInputElement>) => {
        props.onStatusChanged(event.target.value as Status);
    }

    return (
        <Dialog
            fullScreen={isMobile}
            fullWidth={true}
            maxWidth="xs"
            open={props.isOpen}
            onClose={() => props.onCancel() }>

            <DialogTitle>{ 
            isUpdate 
            ? t("asset_create") 
            : t("asset_update")
            }</DialogTitle>

            <DialogContent dividers={true}>
                <Container disableGutters>

                    <TextField
                        autoFocus
                        id="editor-asset-name"
                        type="text"
                        label={ t("asset_name") }
                        value={props.name}
                        variant="outlined"
                        size="small"
                        className={classes.textField}
                        onChange={onNameChanged}/>

                    <FormControl component="fieldset" className={classes.textField}>
                        <FormLabel component="legend">
                            <Typography variant="body2">{ t("status") }</Typography>
                        </FormLabel>
                        <RadioGroup 
                            aria-label={ t("status") } 
                            name="editor-status" 
                            value={props.status} 
                            onChange={onStatusChanged}>
                            <FormControlLabel control={<Radio/>} value={Status.OPERATIONAL} label={ t("status_operational") } />
                            <FormControlLabel control={<Radio/>} value={Status.IDLE} label={ t("status_idle") }/>
                            <FormControlLabel control={<Radio/>} value={Status.UNDER_MAINTENANCE} label={ t("status_under_maintenance") } />
                            <FormControlLabel control={<Radio/>} value={Status.RETIRED} label={ t("status_retired") } />
                        </RadioGroup>
                    </FormControl>

                    <FormControl component="fieldset" className={classes.textField}>
                        <FormLabel component="legend">
                            <Typography variant="body2">{ t("category") }</Typography>
                        </FormLabel>
                        <ListItem button onClick={() => props.onCategorySelect()}>
                            <Typography variant="body2">
                                { props.category?.categoryName !== undefined ? props.category?.categoryName : t("not_set")  }
                            </Typography>
                        </ListItem>
                    </FormControl>

                    <FormLabel component="legend">
                        <Typography variant="body2">{ t("specification") }</Typography>
                    </FormLabel>
                    <List>
                        <SpecificationListItems specifications={props.specs} onItemSelected={props.onSelectSpecification}/>
                        <Button
                            className={classes.textField}
                            startIcon={<PlusIcon className={classes.icon}/>}
                            onClick={() => props.onAddSpecification()}>
                                { t("add") }
                        </Button>
                    </List>
                </Container>
            </DialogContent>

            <DialogActions>
                <Button color="primary" onClick={() => props.onViewQrCode() } disabled={props.id === undefined}>{ t("view_qr_code")}</Button>
                <div style={{flex: '1 0 0'}}></div>
                <Button color="primary" onClick={() => props.onCancel() }>{ t("cancel") }</Button>
                <Button color="primary" onClick={() => onPreSubmit() }>{ t("save") }</Button>
            </DialogActions>

        </Dialog>
    );
}

type SpecificationListItemsPropsType = {
    specifications?: Map<string, string>,
    onItemSelected: (specs: [string, string]) => void
}

const SpecificationListItems = (props: SpecificationListItemsPropsType) => {
    return (
        <React.Fragment>{ 
            props.specifications && Array.from(props.specifications.entries()).map((entry) => {
                return (
                    <ListItem
                        button
                        onClick={() => props.onItemSelected(entry)}
                        key={entry[0]}
                        dense={true}>
                        <ListItemContent 
                            title={entry[1]}
                            summary={entry[0]}/>
                    </ListItem>
                )
            } )
        }</React.Fragment>
    );
}

export default AssetEditorComponent;