import MongooseDataService from "./data.service";
import RouterService from "../commons/router.service";
// const debug = require('debug')('aloe:mongooseService')

export default class MongooseService extends RouterService {

  operations: MongooseDataService

  constructor(app: AloeVera, baseURI: string, options: any) {
    super(app, baseURI, options)

    this.operations = new MongooseDataService({
      model: options.model
    })
  }

  async create(body: any) {
    return await this.operations
      .create(body)
  }

  async read() {
    return await this.operations
      .read();
  }
}
