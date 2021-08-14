import { useTranslation } from "react-i18next"

export const GenericErrorStateComponent = () => {
    const { t } = useTranslation();

    return (
        <div>{ t("error_generic") }</div>
    )
}

export const ErrorNotFoundStateComponent = () => {
    const { t } = useTranslation();

    return (
        <div>{ t("error_not_found") }</div>
    )
}