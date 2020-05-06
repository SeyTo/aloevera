import RouterService from "../commons/router.service";

export interface Ref {
  service: RouterService
  result?: any
  success: boolean
}

export interface DataRef {
  body?: any
}
