import { values } from 'lodash'
import AuthenticationStrategy from '../authentication/strategy'
import DataService from '../commons/data.service'
import { PassportStatic } from 'passport'
import { Strategy as LocalStrategyNative, VerifyFunction } from 'passport-local'
import passport = require('passport')
import {NextFunction} from 'express'

const debug = require('debug')('aloe:LocalStrategy')

/**
 * The current implementation of authentication will check if given 'username' is available across 
 * multiple entities(meaning, check if a user is either in entity1 or entity2 but not both.)
 */
export default class LocalStrategy implements AuthenticationStrategy {

  readonly configKey: string = "local"
  private usernameField: string 
  private passwordField: string

  app: AloeVera
  dataService: DataService
  /**
   * scope/entityName : localStrategy
   */
  // TODO is it VerifyFunction ??
  private scopeLocalStrategyMap = new Map<string, VerifyFunction>()
  /**
   * name: model
   */
  // @DEPRECATED
  entities: {}
  name: string

  constructor(app: AloeVera, configs: any, options: any) {
    this.app = app
    this.dataService = options.dataService
    this.name = options.name

    this.configure(configs[this.configKey])
  }

  configure(configs: { entities: string[], usernameField: string, passwordField: string }): void {
    debug('configuring LocalStrategy')
    // TODO validation here
    // this.entities = this.getEntities(configs.entities)
    this.usernameField = configs.usernameField || "user"
    this.passwordField = configs.passwordField || "password"

    this.scopeLocalStrategyMap = this.defineStrategies(configs['entities'])
  }

  /**
   * Registers with passport as name `this.name + modelName + "local"`
   */
  register(passport: PassportStatic) {
    debug('registering LocalStrategies')

    for (let modelName of this.scopeLocalStrategyMap.keys()) {
      const strategy = this.scopeLocalStrategyMap.get(modelName)
      if (!strategy) {
        throw Error(`Cannot find strategy for ${modelName}`)
      }
      const scopeName = this.nameScope(this.name, modelName, "local")
      debug(`registering LocalStrategy scope with name ${scopeName}`)

      passport.use(
        scopeName,
        new LocalStrategyNative(
          { usernameField: this.usernameField, passwordField: this.passwordField, session: false },
          strategy
        )
      )
    }
  }

  /**
   *
   * Creating scopedStrategy(requirement):
   * - payload should have id, which is used to find entity.
   * - creates strategy where each will use dataService to find a
   * @returns { modelName: strategy }
   */
  private defineStrategies(entities: string[]): Map<string, VerifyFunction> {
    debug('defining strategy for LocalStrategy')
    const modelMap = this.dataService.getModels(entities)
    const scopeStrategyMap = new Map<string, VerifyFunction>()

    // create and define strategies for each model(scope)
    for (const modelName in modelMap) {
      const model = modelMap[modelName]

      // to be used with LocalStrategy(Native)
      // TODO this should be user defined
      const scopedStrategy: VerifyFunction = (username: string, _password: string, done: any) => {
        debug("LocalStrategy called for ${modelName}")

        // this strategy is simply find by given id
        // TODO something went wrong when executing the above code
        // model.find(username)
        this.dataService.findQuery({ "email": username })
          .then((user: any) => {
            // TODO check for refresh token expiration using instanceId
            // TODO can this be modulated?
            debug('done is')
            console.log(user)
            done(null, user)
          })

      }

      scopeStrategyMap.set(modelName, scopedStrategy)
    }

    return scopeStrategyMap;
  }

  /**
   * `data` will require body from request.
   * @param data { body, modelName? }; modelName(entity name) can be used if it is known else all known entities will be tried.
   * @returns [success: boolean, status?: number, message?: string, scope: string]
   */
  async authenticate(req: Request): Promise<any> {
    const data = req.data.body
    const modelName = req.ref['modelName']

    debug('authenticating with LocalStrategy')
    debug(`authentication using V \nmodelName: ${modelName}\nbody: ${JSON.stringify((data))} `)

    debug(`possible scopeLocalStrategyMap are ${this.scopeLocalStrategyMap.size}`)
    // if no modelName is given then try all possible entities
    const entityNames = modelName? [modelName] : [...this.scopeLocalStrategyMap.keys()]

    // create multiple promise structures
    const auths = []
    for (let entityName of entityNames) {
      auths.push(new Promise((resolve, _) => {
        const fullScope = this.nameScope(this.name, entityName, "local")
        debug(`now authenticating for ${fullScope}`)

        passport.authenticate(
          fullScope,
          { session: false },
          (err, user, _info) => {
            console.log('after strategy')
            console.log('errr is')
            console.log(err)
            console.log(user)
            console.log(_info)
            if (err && err.param) {
              return resolve({ success: false, status: 401, error: err, scope: fullScope })
            } else if (err || !user) {
              return resolve({ success: false, status: 401, error: err, scope: fullScope })
            } else {
              // success
              resolve({ success: true, user: user, scope: fullScope })
            }

          }
        )(req, null, null)
      }))
    }

    try {
      const results = await Promise.all(auths)
      let loginResult: {} = null
      results.forEach(v => {
        debug('result of auth is')
        console.log(v)
        if (v.success === true) {
          req.logIn(v.user, { session: false }, (err) => {
            if (err) loginResult = { success: false, status: 401, error: err, scope: v.scope };
            else loginResult = { success: true, scope: v.scope };
          })
        }
      })
      return loginResult;
    } catch (err) {
      throw err
    }

  }

  /**
   * Collection of model name to models.
   * @returns name : model
   */
  // TODO deprecated, use the general method
  getEntities(names: string[]): {} {
    const obj = {}
    names.forEach(name => {
      obj[name] = this.app.get('mongooseClient').model(name)
    })
    return obj;
  }

  async findEntity() {

  }

  private nameScope(... args: string[]): string {
    // return Array.prototype.slice.call(arguments).join(".")
    return args.filter(v => !!v).join(".")
  }

  toString(): string {
    return "LocalStrategy";
  }


}
