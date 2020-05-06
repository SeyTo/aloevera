import passport = require('passport')
import AuthenticationStrategy from './strategy'

export default class AuthenticationBase {
  
  constructor(app: AloeVera) {
    app.use(passport.initialize())
  }

  /**
   * Register different strategies to passport.
   */
  register(...strategies: AuthenticationStrategy[]) {
    strategies.forEach(strategy => {
      strategy.register(passport)
    })  
  }


}
