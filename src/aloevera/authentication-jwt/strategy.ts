const debug = require('debug')('aloe:JwtStrategy')
import AuthenticationStrategy from '../authentication/strategy'
import { ExtractJwt, Strategy as JwtStrategyNative, JwtFromRequestFunction, VerifyCallback } from 'passport-jwt'
import DataService from '../commons/data.service'

/**
 * JWTStrategy to verify a given accessToken.
 */
export default class JwtStrategy implements AuthenticationStrategy {

  app: AloeVera
  dataService: DataService
  readonly configKey: string = "jwt"
  readonly extractorAccessKey: string = "extractor.access"
  /**
   * entityName: jwtStrategy
   */
  private scopeJwtStrategyMap = {}

  constructor(app: AloeVera, configs: any, options: any) {
    this.app = app
    this.dataService = options.dataService
    
    this.configure(configs[this.configKey])
  }

  configure(configs: { entities: string[], options: any }): void {
    // TODO validation here  

    // create scope vs jwtStrategy map for passport.use
    const scopedStrategyMap = this.defineStrategies(configs['entities'])
    for (const entityName in scopedStrategyMap) {
      const strategy = scopedStrategyMap[entityName]

      const jwtStrategy = new JwtStrategyNative({
        secretOrKey: this.app.get('authentication')['accessSecret'],
        jwtFromRequest: this.createExtractors(configs),
        passReqToCallback: true,
        ignoreExpiration: false,
        jsonWebTokenOptions: configs['options']
      }, strategy)

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
    const modelMap = this.dataService.getModels(entities)
    const scopeStrategyMap = {}

    // create and define strategies for each model
    for (const modelName in modelMap) {
      const model = modelMap[modelName] 

      const scopedStrategy = (_req: Request, payload: any, done: VerifyCallback) => {
        debug('scopedStrategy')

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

  private createExtractors(configs: any): JwtFromRequestFunction {
    // get all extractors
    const agreedExtractors = []
    const extractors = {
      'fromBodyField': 'accessToken',
      'fromAuthHeaderWithScheme': 'Bearer',
    }

    console.log('not ')
    console.log(extractors)

    const keys = {
      'fromUrlQueryParameter': ExtractJwt.fromUrlQueryParameter, 
      'fromBodyField': ExtractJwt.fromBodyField, 
      'fromAuthHeaderWithScheme': ExtractJwt.fromAuthHeaderWithScheme
    }

    for (const key in keys) {
      const name = extractors[key]
      if (name) {
        console.log('name is ' + name)
        agreedExtractors.push(keys[key](name))
      }
    }

    return ExtractJwt.fromExtractors(agreedExtractors)
  }

  findEntity() {

  }

  authenticate(_data: any): void {
    throw new Error("Method not implemented.");
  }

}
