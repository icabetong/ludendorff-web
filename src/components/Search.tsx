import { useTranslation } from "react-i18next";
import { 
    FormControl, 
    InputAdornment, 
    InputLabel, 
    OutlinedInput,
    makeStyles
} from "@material-ui/core";
import { SearchIcon } from "@heroicons/react/outline";
import algoliasearch from "algoliasearch/lite";
import { connectSearchBox } from "react-instantsearch-dom";
import { SearchBoxProvided } from "react-instantsearch-core";
import HeroIconButton from "./HeroIconButton";

const useStyles = makeStyles(() => ({
    textField: { width: '100%' }
}))

const CustomSearchBox = (props: SearchBoxProvided) => {
    const classes = useStyles();
    const { t } = useTranslation();

    return (
        <FormControl className={classes.textField} variant="outlined">
            <InputLabel htmlFor="search">{t("field.search")}</InputLabel>
            <OutlinedInput
                id="search"
                value={props.currentRefinement}
                label={t("field.search")}
                endAdornment={
                    <InputAdornment position="end">
                        <HeroIconButton
                            aria-label={t("button.search")}
                            icon={SearchIcon}
                            edge="end"/>
                    </InputAdornment>
                }
                onChange={e => props.refine(e.target.value)}/>
        </FormControl>
    )
}
export const SearchBox = connectSearchBox(CustomSearchBox);
export const Provider = algoliasearch("H1BMXJXRBE", "ecfcef9a59b7ec023817ef3041de6416");