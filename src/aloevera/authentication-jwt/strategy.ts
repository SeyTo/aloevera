import AuthenticationStrategy from '../authentication/strategy'
import { ExtractJwt, Strategy as JwtStrategyNative, JwtFromRequestFunction, VerifyCallback } from 'passport-jwt'
import DataService from '../commons/data.service'
import {PassportStatic} from 'passport'

const debug = require('debug')('aloe:JwtStrategy')

/**
 * JWTStrategy to verify a given accessToken.
 */
export default class JwtStrategy implements AuthenticationStrategy {

  app: AloeVera
  dataService: DataService
  readonly configKey: string = "jwt"
  readonly extractorAccessKey: string = "extractor.access"
  // TODO convert to Map
  /**
   * Scope is understood as entityName.
   * map of entityName(scope): jwtStrategy
   */
  private scopeJwtStrategyMap = {}
  name: string

  /**
   */
  constructor(
    app: AloeVera, 
    configs: any,
    options: { 
      name: string, dataService: DataService
    }) {
    this.app = app
    this.dataService = options.dataService
    this.name = options.name

    this.configure(configs[this.configKey])
  }

  configure(configs: { entities: string[], options: any }): void {
    debug('configuring JwtStrategy')
    // TODO validation here  

    // create scope vs jwtStrategy map for passport.use
    const scopedStrategyMap = this.defineStrategies(configs['entities'])

    // JwtStrategy needs to be defined with options
    for (const entityName in scopedStrategyMap) {
      const strategy = scopedStrategyMap[entityName]

      const jwtStrategy = new JwtStrategyNative({
        secretOrKey: this.app.get('authentication')['accessSecret'],
        jwtFromRequest: this.createExtractors(configs),
        passReqToCallback: true,
        ignoreExpiration: false,
        jsonWebTokenOptions: configs['options']
      }, strategy)

      debug('created strategies for JwtStrategy')
      this.scopeJwtStrategyMap[entityName] = jwtStrategy
    }

  }

  /**
   *
   * Creating scopedStrategy:
   * - payload should have id, which is used to find entity.
   * @returns { } of modelName: strategy
   */
  private defineStrategies(entities: string[]): {} {
    debug('defining strategy for JwtStrategy')
    const modelMap = this.dataService.getModels(entities)
    const scopeStrategyMap = {}

    // create and define strategies for each model
    for (const modelName in modelMap) {
      debug(`for "${modelName}" defining scopedStrategy`)
      const model = modelMap[modelName] 

      // TODO this function should be user defined
      const scopedStrategy = (_req: Request, payload: any, done: VerifyCallback) => {
        debug(`JwtStrategy scopedStrategy called for ${modelName}`)

        // TODO this should be defined by the user
        // this strategy is simply find by given id
        this.dataService.findQuery(model)(payload.id)
          .then((user: any) => {
            // TODO check for refresh token expiration using instanceId
            // TODO can this be modulated?
            done(null, user)
          })

      }

      scopeStrategyMap[modelName] = scopedStrategy
    }

    return scopeStrategyMap;
  }

  register(passport: PassportStatic): void {
    debug('registering JwtStrategy to passport')

    for (const modelName in this.scopeJwtStrategyMap) {
      const strategy = this.scopeJwtStrategyMap[modelName]

      passport.use(
        this.name + modelName + "jwt",
        strategy
      )
    }
  }

  private createExtractors(_configs: any): JwtFromRequestFunction {
    // TODO read from configs
    // get all extractors
    const agreedExtractors = []
    const extractors = {
      'fromBodyField': 'accessToken',
      'fromAuthHeaderWithScheme': 'Bearer',
    }

    const keys = {
      'fromUrlQueryParameter': ExtractJwt.fromUrlQueryParameter,
      'fromBodyField': ExtractJwt.fromBodyField,
      'fromAuthHeaderWithScheme': ExtractJwt.fromAuthHeaderWithScheme
    }

    for (const key in keys) {
      const name = extractors[key]
      if (name) {
        agreedExtractors.push(keys[key](name))
      }
    }

    return ExtractJwt.fromExtractors(agreedExtractors)
  }

  findEntity() {

  }

  async authenticate(req: Request): Promise<any> {
    debug("Authenticating with JwtStrategy")
    // TODO complete this
    throw new Error("Method not implemented.");
  }

  public toString(): string {
    return `JwtStrategy (name: ${this.name})`;
  }

}
