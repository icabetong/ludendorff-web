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
import { SearchBox, Highlight, Provider, Results } from "../../components/Search";
import { Asset } from "./Asset";
import { assetName, assetCategoryName } from "../../shared/const";

const useStyles = makeStyles((theme) => ({
  container: {
    padding: theme.spacing(2),
    minHeight: '80vh'
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
        <Container className={classes.container}>
          <InstantSearch searchClient={Provider} indexName="assets">
            <SearchBox />
            <Results>
              <AssetHits onItemSelect={props.onEditorInvoke} />
            </Results>
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
          <AssetListItem asset={a} onItemSelect={props.onItemSelect} />
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
        primary={<Highlight attribute={assetName} hit={props.asset} />}
        secondary={<Highlight attribute={assetCategoryName} hit={props.asset} />} />
    </ListItem>
  )
}

export default AssetSearchScreen;