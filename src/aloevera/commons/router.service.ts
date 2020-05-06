import {Router, NextFunction} from "express";
import HooksGroup from "./hooks";
import Provider from "../aloevera/provider";
const debug = require('debug')('aloe:service')
import AdapterService from "./service"

export default class RouterService extends AdapterService {


  private hasInitialized: boolean = false

  app: AloeVera
  baseURI: string
  options: RouterServiceOptions
  hooksGroup: HooksGroup = new HooksGroup()
  router: Router

  constructor(app: AloeVera, baseURI: string, options: RouterServiceOptions) {
    super()
    this.app = app
    this.baseURI = baseURI
    this.options = options

    this.router = this.app.createRouter()
  }

  init(router: AloeVera | Router) {
    debug(`init with ${this.baseURI}`)
    if (this.hasInitialized) {
      throw new Error('Service has already been initialized')
    }

    this.hasInitialized = true

    // create all middleware and put them in order
    this.initProviders()
    
    if (this.options.services && Array.isArray(this.options.services)) {
      for (let service of this.options.services) {
        console.log('servie is')
        console.log(service)
        if (service instanceof RouterService) {
          (service as RouterService).init(this.router)
        }
      }
    } // else no inner services defined

    debug(`initialized service for ${this.baseURI}`)
    // initialized app's router with given baseURI
    // @ts-ignore
    router.use(this.baseURI, this.router)

    return this.router;
  }

  private initProviders() {
    let beforeHooks = []
    let afterHooks = [] 
    if (this.options.hooksGroup && Array.isArray(this.options.hooksGroup)) {
      beforeHooks = this.options.hooksGroup.before.filter(v => typeof v === 'object').map(v => v.middleware)
      afterHooks = this.options.hooksGroup.after.filter(v => typeof v === 'object').map(v => v.middleware)
    }

    if (this.options.providers) {
      // for each provider create middleware according to it's method
      for (const provider of this.options.providers) {
        const method = provider.method

        const serviceHooks = (req: Request, _: Response, next: NextFunction) => {
          if (!req.ref) req.ref = { service: null, success: false }
          if (!req.data) req.data = {}

          // collect body, params and other stuffs
          if (req.body) req.data['body'] = req.body

            // other primary keys
            req.ref['providerName'] = provider.name
            req.ref['service'] = this
            next()
        }

        // constructing arguments
        const args = []

        if (beforeHooks.length !== 0) args.push(beforeHooks)
        args.push(provider.getMiddlewares())
        if (afterHooks.length !== 0) args.push(afterHooks)

        // wrap hooks as middlewares
        // create the router for this path
        this.router[method](
          "/",
          serviceHooks,
          ... args
        )

      }
    }

  }

}

export interface RouterServiceOptions {
  /**
   * Service without
   */
  providers?: Provider[]
  services?: AdapterService[]
  hooksGroup?: HooksGroup
}
