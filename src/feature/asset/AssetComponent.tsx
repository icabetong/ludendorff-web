import { useEffect, useState } from "react";
import Box from "@material-ui/core/Box";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import { ListItemContent } from "../../components/ListItemContent";
import { ComponentHeader } from "../../components/ComponentHeader";
import { Asset, AssetRepository } from "./Asset";
import { DocumentSnapshot, DocumentData } from "@firebase/firestore-types";

type AssetComponentPropsType = {
    onDrawerToggle: () => void
}

export const AssetComponent = (props: AssetComponentPropsType) => {
    const [assets, setAssets] = useState<Asset[]>([]);
    const [pageNumber, setPageNumber] = useState<number>(0);
    const [documentHistory, setDocumentHistory] = useState<DocumentSnapshot<DocumentData>[]>([]);

    useEffect(() => {
        AssetRepository.fetch(documentHistory[documentHistory.length - 1])
            .then((data: [Asset[], DocumentSnapshot<DocumentData>]) => {
                setAssets(data[0]);

                let newHistory = documentHistory;
                newHistory.push(data[1]);
                setDocumentHistory(newHistory);
            });
    }, [pageNumber]);

    const onIncrementPageNumber = () => {
        setPageNumber(pageNumber + 1);
    }

    const onDecrementPageNumber = () => {
        let newHistory = documentHistory;
        // we need to pop it two times
        // because the reference we need 
        // is two times behind.
        newHistory.pop();
        newHistory.pop();

        setDocumentHistory(newHistory);
        setPageNumber(pageNumber - 1);
    }

    return (
        <Box>
            <ComponentHeader title="Assets" onDrawerToggle={props.onDrawerToggle}/>
            <List>{
                assets.map((asset: Asset) => {
                    return (
                        <ListItem button key={asset.assetId}>
                            <ListItemContent title={asset.assetName} summary={asset.category?.categoryName}/>
                        </ListItem>
                    )
                })    
            }</List>
            <button onClick={onDecrementPageNumber}>Previous</button>
            <button onClick={onIncrementPageNumber}>Next</button>
        </Box>
    )

}