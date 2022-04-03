import { ComponentClass, FunctionComponent } from "react"

export type Setting = {
  key: string,
  icon?: FunctionComponent<any> | ComponentClass<any, any>,
  title: string,
  summary?: string,
  action?: JSX.Element
}
