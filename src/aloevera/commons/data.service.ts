import AdapterService from "./service"

export default abstract class DataService extends AdapterService {

  app: AloeVera
  options: {
    model: any
  }

  constructor(app: AloeVera, options: any) {
    super()
    this.app = app
    this.options = options
  }

  /**
   * Given entity name, searches from database client.
   * @returns object of modelName: model
   */
  // TODO move this to dataService
  getModels(names: string[]): {} {
    if (!names && names.length === 0) {
      throw new Error('authentication name is required for RefreshStrategy.')
    }

    const obj = {}
    names.forEach(name => {
      obj[name] = this.app.get('mongooseClient').model(name)
    })
    return obj;
  }

  /**
   * Get a finder function or query depending on type of model.
   * Abstracting away how each model should be searched for.
   */
  abstract findQuery (model: any): any

}
