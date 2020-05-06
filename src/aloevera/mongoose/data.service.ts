import DataService from "../commons/data.service";

export default class MongooseDataService extends DataService {

  constructor(app: AloeVera, options?: MongooseDataServiceOptions) {
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

  findQuery(model: any): any {
    return model.findById
  }
}

export interface MongooseDataServiceOptions {
  /**
   * Mongoose data model.
   */
  model: any
}
