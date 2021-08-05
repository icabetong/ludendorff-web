import React, {useEffect, useState} from "react";
import {Asset, AssetRepository} from "./Asset";

export const AssetComponent: React.FC = () => {
    const [assets, setAssets] = useState<Asset[]>([]);

    useEffect(() => {
        AssetRepository.fetch()
            .then((data) => {
                setAssets(data)
            })
    }, [assets]);

    return (
        <div>
            {assets.map((asset: Asset) =>
                <div>
                    <div>{asset.assetName}</div>
                    <div>{asset.assetId}</div>
                </div>
            )}
        </div>
    );
}