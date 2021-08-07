import React, { useEffect, useState } from "react";
import { Asset, AssetRepository } from "./Asset";
import { DocumentSnapshot, DocumentData } from "@firebase/firestore-types";

export const AssetComponent: React.FC = () => {
    const [assets, setAssets] = useState<Asset[]>([]);
    const [triggerFetch, setTriggerFetch] = useState<Boolean>(false);
    const [lastDocument, setLastDocument] = useState<DocumentSnapshot<DocumentData> | null>(null);

    useEffect(() => {
        setTriggerFetch(false);
        AssetRepository.fetch(lastDocument)
            .then((data: [Asset[], DocumentSnapshot<DocumentData>]) => {
                setAssets(data[0]);
                setLastDocument(data[1]);
            });
    }, [triggerFetch]);

    const onTriggerFetch = () => {
        setTriggerFetch(true);
    }

    return (
        <div>
            { assets.map((asset: Asset) => { return <div key={asset.assetId}>{asset.assetName}</div> })}
            <button onClick={onTriggerFetch}>Next</button>
        </div>
    )

}