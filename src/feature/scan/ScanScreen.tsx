import { useRef, useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import Box from "@material-ui/core/Box";

import { FolderOpenIcon, QrcodeIcon } from "@heroicons/react/outline";

import EmptyStateComponent from "../state/EmptyStates";
import ComponentHeader from "../../components/ComponentHeader";

type ScanScreenProps = {
    onDrawerToggle: () => void
}

const ScanScreen = (props: ScanScreenProps) => {
    const { t } = useTranslation();
    const fileInput = useRef<HTMLInputElement | null>(null);
    const imageInput = useRef<HTMLImageElement | null>(null);

    const [imageBase, setImageBase] = useState<string>('');

    useEffect(() => {
        if (imageInput !== null) {

        }
    }, [imageBase]);

    const onFileSelected = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files?.length > 0) {
            const file = event.target.files[0];
            let fileReader = new FileReader();
            fileReader.readAsDataURL(file);
            fileReader.onload = () => {
                if (fileReader !== null) {
                    setImageBase(fileReader.result as string);
                }
            }
            fileReader.onerror = (error) => {
                console.log(error);
            }
        }
    }

    return (
        <Box>
            <ComponentHeader 
                title={ t("navigation.scan") } 
                onDrawerToggle={props.onDrawerToggle}
                buttonText={ t("select") }
                buttonIcon={FolderOpenIcon}
                buttonOnClick={() => fileInput.current!!.click()}/>
            <input ref={fileInput} type="file" accept="image/*" onChange={onFileSelected} hidden/>
            { imageBase !== ''
                ? <img src={imageBase} ref={imageInput} alt="code" hidden={imageBase === null}/>
                : <EmptyStateComponent
                    icon={QrcodeIcon}
                    title={t("empty_scanned_code")}
                    subtitle={t("empty_scanned_code_summary")}/>
            }
        </Box>
    )
}

export default ScanScreen;