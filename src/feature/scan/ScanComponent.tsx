import { useRef, useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import Box from "@material-ui/core/Box";
import { makeStyles } from "@material-ui/core/styles";

import FolderOpenIcon from "@heroicons/react/outline/FolderOpenIcon";

import { ComponentHeader } from "../../components/ComponentHeader";

type ScanComponentPropsType = {
    onDrawerToggle: () => void
}

const useStyles = makeStyles(() => ({
    icon: {
        width: '1em',
        height: '1em'
    }
}));

const ScanComponent = (props: ScanComponentPropsType) => {
    const classes = useStyles();
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
                title={ t("scan") } 
                onDrawerToggle={props.onDrawerToggle}
                buttonText={ t("select") }
                buttonIcon={<FolderOpenIcon className={classes.icon}/>}
                buttonOnClick={() => fileInput.current!!.click()}/>
            <input ref={fileInput} type="file" accept="image/*" onChange={onFileSelected} hidden/>
            { imageBase &&
                <img src={imageBase} ref={imageInput} alt="code" hidden={imageBase === null}/>
            }
        </Box>
    )
}

export default ScanComponent;