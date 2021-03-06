import DataService from "../commons/data.service";

const debug = require('debug')('aloe:MongooseDataService')

export default class MongooseDataService extends DataService {

  constructor(app: AloeVera, options?: MongooseDataServiceOptions) {
    // TODO expand into another options class
    super(app, options)
    debug('MongooseDataService constructed.')
  }

  async create(body: any) {
    return await this.options.model
      .create(body)
  }

  async read() {
    return await this.options.model
      .find();
  }

  /**
   * @returns function callable function
   */
  findQuery(args: {}): Promise<any> {
    return this.options.model.findOne(args)
  }

}

export interface MongooseDataServiceOptions {
  /**
   * Mongoose data model.
   */
  model: any
}
