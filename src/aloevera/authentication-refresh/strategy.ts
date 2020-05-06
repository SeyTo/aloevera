import AuthenticationStrategy from '../authentication/strategy'
import DataService from '../commons/data.service'

export default class RefreshStrategy implements AuthenticationStrategy {

  readonly configKey: string = 'refresh'
  private accessTokenField: string
  private refreshTokenField: string

  app: AloeVera
  dataService: DataService
  entities: {}

  constructor(app: AloeVera, configs: any, options: any) {
    this.app = app
    this.dataService = options.dataService

    this.configure(configs[this.configKey])
  }

  configure(configs: any): void {
    this.entities = this.getEntities(configs["entities"])
    this.accessTokenField = configs['accessTokenField']
    this.refreshTokenField = configs['refreshTokenField']
  }

  /**
   * Given entity name, searches from database client.
   */
  // TODO move this to dataService
  getEntities(names: string[]): {} {
    if (!names && names.length === 0) {
      throw new Error('authentication name is required for RefreshStrategy.')
    }

    const obj = {}
    names.forEach(name => {
      obj[name] = this.app.get('mongooseClient').model(name)
    })
    return obj;
  }

  async findEntity() {

  }

  async authenticate(data: any): void {
    console.log()
  }
  
}
