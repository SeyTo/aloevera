import { asyncMiddleware } from '../../aloevera/aloevera/utils'
import Provider from '../../aloevera/aloevera/provider'
import {NextFunction} from 'express';
import HooksGroup from '../../aloevera/commons/hooks';
import { mSuccess, mSuccessData } from '../../utils/hooks/response'
import { getModel } from '../../model/users/client.model'
import MongooseService from '../../aloevera/mongoose/router.service'
import createTransactionService from './transaction/transaction.service';

// SERVICES

class ClientService extends MongooseService {
  
  constructor(
    app: AloeVera,
    baseURI: string, 
    options: any
  ) {
    super(app, baseURI, options)
  }

  async create(data: any) {
    return await super.create(data);
  }

  async read() {
    return await super.read();
  }
}

// MIDDLEWARES

const mCreateClient = function () {
  return asyncMiddleware(async (req: Request, _res: Response, next: NextFunction) => {

    const result = await (req.ref.service as ClientService).create(req.data.body)

    req.ref.result = result
    req.ref.success = true

    next()
  });
}

const mGetClient = function () {
  return asyncMiddleware(async (req: Request, _res: Response, next: NextFunction) => {

    const result = await (req.ref.service as ClientService).read()

    req.ref.result = result
    req.ref.success = true

    next()
  });
} 

const mParseBody = function (req: Request, _: Response, next: NextFunction) {
  req.data.body.testBody = "hello test"
  next()
}

// PROVIDERS

const createProviders = function () {
  return [
    new Provider(
      'post',
      mCreateClient(),
      new HooksGroup(
        [mParseBody],
        [mSuccess]
      )
    ),

    new Provider(
      'get',
      mGetClient(),
      new HooksGroup(
        [],
        [mSuccessData]
      )
    )
  ]
}

// MAIN FUNCTION

export default function (app: AloeVera) {
  const services = [createTransactionService(app)] 
  const options = {
    providers: createProviders(),
    model: getModel(app),
    services,
  }

  const clientService = new ClientService(
    app,
    '/client',
    options
  )

  app.useService(clientService)
}
