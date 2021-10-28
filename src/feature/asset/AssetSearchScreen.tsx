import {
    Container,
    Dialog,
    DialogContent,
    ListItem,
    ListItemText,
    makeStyles
} from "@material-ui/core";
import { InstantSearch, connectHits } from "react-instantsearch-dom";
import { HitsProvided } from "react-instantsearch-core";
import { SearchBox, Provider } from "../../components/Search";
import { Asset } from "./Asset";

const useStyles = makeStyles((theme) => ({
    container: {
        padding: theme.spacing(2),
        minHeight: '60vh'
    }
}))

type AssetSearchScreenProps = {
    isOpen: boolean,
    onEditorInvoke: (asset: Asset) => void
    onDismiss: () => void
}

const AssetSearchScreen = (props: AssetSearchScreenProps) => {
    const classes = useStyles();
    
    return (
        <Dialog 
            open={props.isOpen} 
            onClose={props.onDismiss}
            fullWidth={true}
            maxWidth="md">
            <DialogContent dividers={true}>
                <Container disableGutters className={classes.container}>
                    <InstantSearch searchClient={Provider} indexName="assets">
                        <SearchBox/>
                        <AssetHits onItemSelect={props.onEditorInvoke}/>
                    </InstantSearch>
                </Container>
            </DialogContent>
        </Dialog>
    )
}

type AssetListProps = HitsProvided<Asset> & {
    onItemSelect: (asset: Asset) => void
}
const AssetList = (props: AssetListProps) => {
    return (
        <>
        {
            props.hits.map((a: Asset) => (
                <AssetListItem asset={a} onItemSelect={props.onItemSelect}/>
            ))
        }
        </>
    )
}
const AssetHits = connectHits<AssetListProps, Asset>(AssetList);

type AssetListItemProps = {
    asset: Asset,
    onItemSelect: (asset: Asset) => void
}
const AssetListItem = (props: AssetListItemProps) => {
    return (
        <ListItem
            button
            key={props.asset.assetId}
            onClick={() => props.onItemSelect(props.asset)}>
            <ListItemText
                primary={props.asset.assetName}
                secondary={props.asset.category?.categoryName}/>
        </ListItem>
    )
}

export default AssetSearchScreen;