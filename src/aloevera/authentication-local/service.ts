import RouterService, {RouterServiceOptions} from "../commons/router.service";
import DataService from "../commons/data.service";
import AuthenticationStrategy, {createStrategy} from "../authentication/strategy";
import JwtStrategy from "../authentication-jwt/strategy";
import LocalStrategy from "./strategy";
import RefreshStrategy from "../authentication-refresh/strategy";
import {NextFunction} from "express";

const debug = require('debug')('aloe:AuthService')

// TODO move this class to something more intuitive place
export default class AuthService extends RouterService {

  // data service from which entities will be retreived
  strategies: Map<string, AuthenticationStrategy> // of AuthenticationStrategy

  /**
   * AuthService.strategies is created on construction.
   */
  constructor(
    app: AloeVera,
    baseURI: string,
    options: LocalServiceOptions
  ) {
    super(app, baseURI, options)

    if (!options.name) {
      throw new Error('options.name is required. It should point to configuration name in authentication.')
    }

    this.configure(app.get('authentication')[options.name])
  }

  private configure(authConfig: any) {
    debug('configuring AuthService')

    if (!authConfig['authStrategies']) {
      throw new Error('"authStrategies" should be defined in config.')
    }

    // define all auth strategies
    this.strategies = new Map()
    authConfig['authStrategies'].forEach((name: string) => {
      debug('creating strategy for ' + name)
      this.strategies.set(name, createStrategy(name, this.app, authConfig, <LocalServiceOptions>this.options))
    })

  }

  /**
   * @param { keys: [depends on type], type: [jwt, local] } keys depends on 'type'.
   */
  async authenticate(req: Request, res: Response, next: NextFunction): Promise<any> {
    const type = req.body['type']
    debug(`calling ${type} strategy.`)
    switch (type) {
      case 'jwt':
        return (<JwtStrategy>this.strategies.get('jwt')).authenticate(req)
      case 'local':
        return (<LocalStrategy>this.strategies.get('local')).authenticate(req)
      case 'refresh':
        return (<RefreshStrategy>this.strategies.get('refresh')).authenticate(req)
      default:
        throw "Unknown type of strategy defined";
    }
  }
}

interface LocalServiceOptions extends RouterServiceOptions {
  name: string
  dataServices?: Map<string, DataService>,
  dataService?: DataService
}
