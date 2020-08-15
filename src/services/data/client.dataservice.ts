import DataService from "../../aloevera/commons/data.service";

const debug = require('debug')('aloe:ClientDataService')

export default class ClientDataService extends DataService {

  constructor(app: AloeVera, options?: ClientDataServiceOptions) {
    // TODO expand into another options class
    super(app, options)
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

export interface ClientDataServiceOptions {
  /**
   * Mongoose data model.
   */
  model: any
}
