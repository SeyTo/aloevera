import express = require('express')
import Service from '../commons/service'
import {Ref, DataRef} from './middleware'
import RouterService from '../commons/router.service'
const debug = require('debug')('aloe:app')

declare global {
  interface AloeVera extends express.Express {
    services: RouterService[]
    test(): any
    createRouter(options?: express.RouterOptions): express.Router
    useService(service: Service): any
    configure(fn: Function): any
  }

  interface Request extends express.Request {
    ref: Ref
    data: DataRef
    status?: Number
  }
}

// let a: String = ""
// a.test()

export default function (): AloeVera {

  // @ts-ignore
  const expressApp: AloeVera = express()

  expressApp.services = []


  expressApp.useService = function (service: RouterService) {
    debug('registering a service')

    service.init(expressApp)
    expressApp.services.push(service)
  }

  expressApp.configure = function (fn: Function) {
    fn(this) 

    return this;
  }

  expressApp.createRouter = function (options: express.RouterOptions) {
    return express.Router(options);
  }

  expressApp.test = function () {
    console.log('ok')
  }

  debug('app created')

  return expressApp;
}
