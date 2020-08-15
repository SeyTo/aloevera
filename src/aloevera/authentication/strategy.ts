import { pick } from 'lodash'
import JwtStrategy from "../authentication-jwt/strategy"
import LocalStrategy from "../authentication-local/strategy"
import RefreshStrategy from "../authentication-refresh/strategy"
import {PassportStatic} from 'passport'
import DataService from '../commons/data.service'

const debug = require('debug')('aloe:auth:strategy')

/**
 * A strategy to verify given input.
 */
export default interface AuthenticationStrategy {
  /**
   * Read configuration and prepare an implmentation.
   */
  configure(configs: any): void

  register(passport: PassportStatic): void
  /**
   * Authenticate the given data.
   */
  authenticate(req: Request): Promise<any>
}

/**
 * Supplying a single DataService means all strategies will use the same DataService. If Map<name, DataService> is provided
 * then depending on the name dataService is assigned.
 *
 * @param name name of strategy matching to its config name.
 * @param options: { DataService, name: string } DataService can be either Map<name, DataService> or DataService.
 * @returns AuthenticationStrategy returns an eligible strategy. Depends on `name` param.
 */
export function createStrategy(
  name: string, 
  app: AloeVera, 
  configs: any, 
  options: {
    name: string,
    dataService?: DataService,
    dataServices?: Map<string, DataService>
  }
): AuthenticationStrategy {
  
  // return a valid DataService
  const getDataService = function(options: any, name: string): DataService {
    if (options.dataService) {
      return options.dataService;
    } else {
      return options.dataServices.get(name);
    }
  }

  const optionsParsed = { name: options.name, dataService: null }
  optionsParsed.dataService = getDataService(options, name)

  switch (name) {
    case 'jwt':
      return new JwtStrategy(
        app,
        pick(configs, ['jwt']),
        optionsParsed
      )
    case 'local':
      return new LocalStrategy(
        app, 
        pick(configs, ['local']),
        optionsParsed
      )
    case 'refresh':
      return new RefreshStrategy(
        app,
        pick(configs, ['refresh']),
        optionsParsed
      );
    default:
      throw new Error(`unknown strategy name: ${name}`)
  }
}
