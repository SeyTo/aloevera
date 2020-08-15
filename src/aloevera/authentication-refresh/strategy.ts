import AuthenticationStrategy from '../authentication/strategy'
import { Strategy as JwtStrategyNative, VerifyCallback, VerifiedCallback, ExtractJwt, JwtFromRequestFunction } from 'passport-jwt'
import DataService from '../commons/data.service'

const debug = require('debug')('aloe:RefreshStrategy')

/**
 * RefreshStrategy is similar to JwtStrategy where except instead of accessToken, refreshToken is validated and renewed.
 * Configuration will require jwt options(see passport-jwt)
 */
export default class RefreshStrategy implements AuthenticationStrategy {

  readonly configKey: string = 'refresh'

  app: AloeVera
  dataService: DataService
  readonly configKey: string = 'refresh'
  private scopeRefreshStrategyMap = {}
  name: string

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

  configure(configs: any): void {
    debug('configuring RefreshStrategy')

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
      
      debug('created strategy for RefreshStrategy')
      this.scopeRefreshStrategyMap[entityName] = jwtStrategy
    }
    
  }

  private defineStrategies(entities: string[]): {} {
    debug('defining strategy for RefreshStrategy')
    const modelMap = this.dataService.getModels(entities)
    const scopeStrategyMap = {}

    // create and define strategies for each model
    for (const modelName in modelMap) {
      debug(`for "${modelName}" defining scopedStrategy`)
      const model = modelMap[modelName] 

      // TODO this function should be user defined
      const scopedStrategy = (_req: Request, payload: any, done: VerifyCallback) => {
        debug(`RefreshStrategy scopedStrategy called for ${modelName}`)

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
    debug('registering RefreshStrategy to passport')

    for (const modelName in this.scopeJwtStrategyMap) {
      const strategy = this.scopeRefreshStrategyMap[modelName]

      passport.use(
        this.name + modelName + "jwt",
        strategy
      )
    }
  }

  /**
   * Create JWT based extractors.
   */
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



  /**
   * Given entity name, searches from database client.
   */
  // TODO move this to dataService
  getEntities(names: string[]): {} {
    if (!names && names.length === 0) {
      throw new Error('authentication name is required for RefreshStrategy.')
    }

    const obj = {}
    names.forEach(name => {
      obj[name] = this.app.get('mongooseClient').model(name)
    })
    return obj;
  }

  async findEntity() {

  }

  async authenticate(req: Request): Promise<any> {
    debug("Authenticating with RefreshStrategy")
    // TODO complete this
    throw new Error("Method not implemented.");
  }

  toString(): string {
    // TODO 
    return "RefreshStrategy TODO";
  }
  
}
