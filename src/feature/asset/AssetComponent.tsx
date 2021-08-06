import React, { useEffect, useState } from "react";
import { Asset, AssetRepository } from "./Asset";

export const AssetComponent = () => {
    const [assets, setAssets] = useState<Asset[]>([]);

    useEffect(() => {
        AssetRepository.fetch()
            .then((data) => {
                setAssets(data)
            })
    }, []);

    return (
        <div>
            { assets.map((asset: Asset) => { return <div key={asset.assetId}>{asset.assetName}</div> })}
        </div>
    )

}