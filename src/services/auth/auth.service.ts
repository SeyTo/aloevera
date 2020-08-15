import AuthService from "../../aloevera/authentication-local/service";
import { NextFunction } from 'express'
import MongooseDataService from "../../aloevera/mongoose/data.service";
import { getModel as getClientModel } from '../../model/users/client.model'
import AuthenticationBase from "../../aloevera/authentication";
import DataService from "../../aloevera/commons/data.service";
import Provider from "../../aloevera/aloevera/provider";
import {asyncMiddleware} from "../../aloevera/aloevera/utils";
import HooksGroup from "../../aloevera/commons/hooks";

const debug = require('debug')('aloe:auth.service')

const mPreAuthVerifier = function(req: Request, res: Response, next: NextFunction) {
  debug('pre auth verification')
  
  // TODO specify modelName
  // req.ref['modelName']
}

const mAuthenticate = function () {
  return asyncMiddleware(async (req: Request, _res: Response, next: NextFunction) => {

    debug('authentication calling')
    console.log(req.data)

    // validate req.data.body.type { jwt | local | refresh }
    // validate req.data.body.param { jwt | local | refresh }

    const result = await (req.ref.service as AuthService).authenticate(req, _res, next)

    req.ref.success = result.success
    req.ref.result = {
      scope: result.scope,
      status: result.status,
      error: result.error
    }

    next()
  });
}

const mSimple = function (req: Request, res: Response, next: NextFunction) {
  debug("got to next")
  res.send("okok")
}

// TODO work with validator middleware
// const mValidator

const mRandomPreMiddleware = function (_req: Request, res: Response, next: NextFunction) {
  debug("Pre hook for authentication called")
  next()
}

export function createService (app: AloeVera) {
  debug('creating service')
  const authBase = new AuthenticationBase(app)

  // create new AuthService (LocalAuthService)
  // this auth service can a singleton and then be shared across multiple interfaces
  let dataService = new MongooseDataService(
    app,
    {
      model: getClientModel(app)
    }
  )

  /**
   * Anon override of findQuery.
   * The auth will put a string data into param which is why a special override is needed
   * instead of using the regular MongooseDataService.
   * @param user could be email or user
   * @returns Promise<any>
   */
  dataService.findQuery = function(user: string): Promise<any> {
    // TODO identify
    debug('findQuery called')
    return this.options.model.findOne(user);
  }

  const providers = [
    new Provider(
      "post",
      mAuthenticate(),
      new HooksGroup(
        [mRandomPreMiddleware]
      )
    ),

    new Provider(
      "get",
      mSimple,
      new HooksGroup(
        [mRandomPreMiddleware]
      )
    )
  ]

  // TODO assign providers
  var authService = new AuthService(
    app,
    '/auth',
    {
      name: 'authService',
      dataService: null,
      dataServices: new Map<string, DataService>([
        ['jwt', dataService],
        ['local', dataService],
        ['refresh', dataService]
      ]),
      providers
    }
  )

  authBase.register(authService.strategies)
  // when registering middleware strategies
  // authBase.register(jwtMiddleware.strategies)

  return authService;
}

export function configure(app: AloeVera) {
  app.useService(createService(app))
}
