import { useEffect, useState } from "react";
import Box from "@material-ui/core/Box";
import Hidden from "@material-ui/core/Hidden";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import { makeStyles } from "@material-ui/core/styles";
import { DataGrid, GridValueGetterParams } from "@material-ui/data-grid";
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

    const useStyles = makeStyles((theme) => ({
        root: {
            height: '100%',
            width: '100%'
        },
        wrapper: {
            height: '80%',
            padding: '1.4em'
        }
    }));
    const classes = useStyles();

    const columns = [
        { field: Asset.FIELD_ASSET_ID, headerName: 'ID', hide: true },
        { field: Asset.FIELD_ASSET_NAME, headerName: 'Name', flex: 1 },
        { field: Asset.FIELD_CATEGORY, headerName: 'Category', flex: 0.5, valueGetter: (params: GridValueGetterParams) => params.row.category?.categoryName },
        { field: Asset.FIELD_DATE_CREATED, headerName: 'Date Created', flex: 0.5 },
        { field: Asset.FIELD_STATUS, headerName: 'Status', flex: 0.25 }
    ]

    return (
        <Box className={classes.root}>
            <ComponentHeader title="Assets" onDrawerToggle={props.onDrawerToggle}/>
            <Hidden xsDown>
                <div className={classes.wrapper}>
                    <DataGrid
                        columns={columns}
                        rows={assets}
                        getRowId={(r) => r.assetId}
                        pageSize={15}
                        hideFooterPagination/>
                </div>
            </Hidden>
            <Hidden smUp>
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
            </Hidden>
            
        </Box>
    )

}