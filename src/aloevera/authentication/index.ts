import passport = require('passport')
import AuthenticationStrategy from './strategy'

const debug = require('debug')('aloe:auth')

export default class AuthenticationBase {
  
  constructor(app: AloeVera) {
    debug('passport initialized')
    app.use(passport.initialize())
  }

  /**
   * Register different strategies to passport.
   */
  register(strategies: Map<string, AuthenticationStrategy>) {
    debug(`${strategies.size} strategies are found.`)
    for (let sName of strategies.keys()) {
      debug(`registering ${sName} strategy to passport.`)
      strategies.get(sName).register(passport)
    }
  }


}
