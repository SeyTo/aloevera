import MongooseDataService, {MongooseDataServiceOptions} from "../../../aloevera/mongoose/data.service"
import {getModel} from "../../../model/transaction/transaction.model";
import RouterService, { RouterServiceOptions } from "../../../aloevera/commons/router.service";
import Provider from "../../../aloevera/aloevera/provider";
import {asyncMiddleware} from "../../../aloevera/aloevera/utils";
import {NextFunction} from "express";
import HooksGroup from "../../../aloevera/commons/hooks";
import {mSuccess, mSuccessData} from "../../../utils/hooks/response";
const debug = require('debug')('aloe:transactionService')

export class TransactionService extends RouterService {

  dataService: MongooseDataService

  constructor(app: AloeVera, baseURI: string, options: any) {
    super(app, baseURI, options as RouterServiceOptions)
    this.dataService = new MongooseDataService({
      model: options.model
    })
  }

  async create(data: any) {
    return await this.dataService.create(data);
  }

  async read() {
    return await this.dataService.read();
  }
}

// MIDDLEWARES

const mCreateTransaction = function () {
  return asyncMiddleware(async (req: Request, _res: Response, next: NextFunction) => {
     
    const result = await (req.ref.service as TransactionService).create(req.data.body)

    req.ref.result = result
    req.ref.success = true

    next()
  });
}

const mGetTransaction = function () {
  return asyncMiddleware(async (req: Request, _res: Response, next: NextFunction) => {

    const result = await (req.ref.service as TransactionService).read()

    req.ref.result = result
    req.ref.success = true

    next()  
  });
}

// CREATE PROVIDER

const createProviders = function (): Provider[] {
  return [
    new Provider(
      'post',
      mCreateTransaction(), 
      new HooksGroup(
        [],
        [mSuccess]
      )
    ),

    new Provider(
      'get',
      mGetTransaction(), 
      new HooksGroup(
        [],
        [mSuccessData]
      )
    )
  ];
}

export default function createService (app: AloeVera) {

  const transactionService = new TransactionService(
    app,
    '/transaction',
    {
      providers: createProviders(),
      model: getModel(app)
    }
  )

  debug('creating transcation service')
  return transactionService;
} 
