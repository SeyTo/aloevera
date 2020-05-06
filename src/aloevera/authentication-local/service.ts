import RouterService, {RouterServiceOptions} from "../commons/router.service";
import DataService from "../commons/data.service";
import {createStrategy} from "../authentication/strategy";
import JwtStrategy from "../authentication-jwt/strategy";
import LocalStrategy from "./strategy";
import RefreshStrategy from "../authentication-refresh/strategy";

export default class AuthService extends RouterService {

  // data service from which entities will be retreived
  strategies: object // of AuthenticationStrategy

  constructor(
    app: AloeVera, 
    baseURI: string, 
    options: LocalServiceOptions
  ) {
    super(app, baseURI, options)

    if (!options.name || options.name === '') {
      throw new Error('options.name is required. It should point to configuration name in authentication.')
    }

    this.configure(app.get('authentication')[options.name])
  }

  private configure(authConfig: any) {
    if (!authConfig['authStrategies']) {
      throw new Error('"authStrategies" should be defined in config.')
    }

    // define all auth strategies
    this.strategies = []
    authConfig['authStrategies'].forEach((name: string) => {
      this.strategies[name] = createStrategy(name, this.app, authConfig, this.options)
    })

  }

  /**
   * @param { keys: [depends on type], type: [jwt, local] } keys depends on 'type'.
   */
  async authenticate(body: { params: any, type: 'jwt' | 'local' | 'refresh' }) {
    // TODO 
    switch (body.type) {
      case 'jwt':
        (<JwtStrategy>this.strategies['jwt']).authenticate()
        break
      case 'local':
        (<LocalStrategy>this.strategies['local']).authenticate()
        break
      case 'refresh':
        <RefreshStrategy>this.strategies['refresh'].authenticate()
        break

    }
    return await this.strategy.authenticate(body)


  }
}

interface LocalServiceOptions extends RouterServiceOptions {
  name: string
  dataService: DataService
}
