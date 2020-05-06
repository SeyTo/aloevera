import { values } from 'lodash'
const debug = require('debug')('LocalStrategy')
import AuthenticationStrategy from '../authentication/strategy'
import DataService from '../commons/data.service'
import {modelNames} from 'mongoose'
import {PassportStatic} from 'passport'

export default class LocalStrategy implements AuthenticationStrategy {

  readonly configKey: string = "local"
  private usernameField: string 
  private passwordField: string 

  app: AloeVera
  dataService: DataService
  /**
   * scope/entityName : localStrategy
   */
  scopeLocalStrategyMap: {} 
  /**
   * name: model
   */
  entities: {}
  name: string

  constructor(app: AloeVera, configs: any, options: any) {
    this.app = app
    this.dataService = options.dataService
    this.name = options.name

    this.configure(configs[this.configKey])
  }

  configure(configs: { entities: string[], usernameField: string, passwordField: string }): void {
    // TODO validation here
    // this.entities = this.getEntities(configs.entities)
    this.usernameField = configs.usernameField || "user"
    this.passwordField = configs.passwordField || "password"

    this.defineStrategies(configs['entities'])
  }

  register(passport: PassportStatic) {
    for (const modelName in this.entities) {
      const model = this.entities[modelName]

      passport.use(
        this.name + modelName + "local",

      )

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

  /**
   *
   * Creating scopedStrategy(requirement):
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

  /**
   * `data` will require body from request.
   * @param data { body, modelName }; modelName can be used if it is known.
   */
  async authenticate(data: { body: any, modelName?: string }): Promise<void> {
    debug('authenticating')
    const userkey = data.body[this.usernameField]
    const password = data.body[this.passwordField]
    let models
    if (data.modelName)
    models = [this.entities[data.modelName]]
    else
    models = values(this.entities)




    // check if password is correct from the given entities
  }


}
