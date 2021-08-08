import React, { useEffect, useState } from "react";
import { Asset, AssetRepository } from "./Asset";
import { DocumentSnapshot, DocumentData } from "@firebase/firestore-types";

export const AssetComponent: React.FC = () => {

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
        <div>
            { assets.map((asset: Asset) => { return <div key={asset.assetId}>{asset.assetName}</div> })}
            <button onClick={onDecrementPageNumber}>Previous</button>
            <button onClick={onIncrementPageNumber}>Next</button>
        </div>
    )

}