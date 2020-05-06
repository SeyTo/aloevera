import AuthService from "../../aloevera/authentication-local/service";
import MongooseDataService from "../../aloevera/mongoose/data.service";
import { getModel as getClientModel } from '../../model/users/client.model'
import passport = require('passport')
import AuthenticationBase from "../../aloevera/authentication";

export function createService (app: AloeVera) {

  const authBase = new AuthenticationBase(app)

  let dataService = new MongooseDataService(
    app,
    {
      model: getModel(app)
    }
  )

  let options = {
    dataService: dataService,
    name: 'localService'
  }

  var authService = new AuthService(
    app,
    '/auth',
    options
  )

  authBase.register(authService.strategies)
  // when registering middleware strategies
  // authBase.register(jwtMiddleware.strategies)

  return authService;
}

export function configure(app: AloeVera) {
  app.useService(createService(app))
}
