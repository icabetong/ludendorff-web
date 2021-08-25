import { FunctionComponent, ComponentClass } from "react"

export type Preference = {
    key: string,
    icon?: FunctionComponent<any> | ComponentClass<any, any>,
    title: string,
    summary?: string,
    action?: JSX.Element
}
