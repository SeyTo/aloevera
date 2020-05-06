import { pick } from 'lodash'
import JwtStrategy from "../authentication-jwt/strategy"
import LocalStrategy from "../authentication-local/strategy"
import RefreshStrategy from "../authentication-refresh/strategy"
import {PassportStatic} from 'passport'

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
  authenticate(data: any): void
} 

export function createStrategy(name: string, app: AloeVera, configs: any, options: any): AuthenticationStrategy {
  switch (name) {
    case 'jwt':
      return new JwtStrategy(
        app,
        pick(configs, ['jwt']),
        pick(options, ['dataService', 'name'])
      )
    case 'local':
      return new LocalStrategy(
        app, 
        pick(configs, ['local']), 
        pick(options, ['dataService', 'name'])
      )
    case 'refresh':
      return new RefreshStrategy(
        app,
        pick(configs, ['refresh']),
        pick(options, ['dataService', 'name'])
      );
    default:
      throw new Error(`unknown strategy name: ${name}`)
  }
}
