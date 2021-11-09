import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { 
    Button,
    Dialog,
    DialogContent,
    DialogTitle,
    DialogActions,
    FormControl,
    InputLabel,
    MenuItem,
    Select,
    useTheme,
    useMediaQuery
} from "@material-ui/core";

enum Source { 
    ASSET = "assets",
    USER = "users",
    ASSIGNMENTS = "assignments"
}

type ReportScreenProps = {
    isOpen: boolean,
    onDismiss: () => void,
}
const ReportScreen = (props: ReportScreenProps) => {
    const { t } = useTranslation();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('xs'));
    const [source, setSource] = useState<Source | undefined>(undefined);

    const onSourceChanged = (event: React.ChangeEvent<{ value: unknown }>) => setSource(event.target.value as Source)

    return (
        <Dialog
            fullScreen={isMobile}
            fullWidth={true}
            maxWidth="xs"
            open={props.isOpen}
            onClose={props.onDismiss}>
            <DialogTitle>{t("navigation.reports")}</DialogTitle>
            <DialogContent>
                <FormControl variant="outlined" fullWidth>
                    <InputLabel id="source">{t("field.source")}</InputLabel>
                    <Select 
                        labelId="source" 
                        label={t("field.source")}
                        defaultValue="none"
                        value={source}
                        onChange={onSourceChanged}>
                        <MenuItem value={undefined}>
                            <em>{t("placeholder.none")}</em>
                        </MenuItem>
                        <MenuItem value={Source.ASSET}>
                            {t("navigation.assets")}
                        </MenuItem>
                        <MenuItem value={Source.USER}>
                            {t("navigation.users")}
                        </MenuItem>
                    </Select>
                </FormControl>
                { 
                    source && source
                }
            </DialogContent>
            <DialogActions>
                <Button 
                    color="primary"
                    onClick={props.onDismiss}>
                    {t("button.cancel")}
                </Button>
                <Button
                    color="primary">
                    {t("button.continue")}
                </Button>
            </DialogActions>
        </Dialog>
    )
}

export default ReportScreen;
