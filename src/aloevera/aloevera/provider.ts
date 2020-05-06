import HooksGroup from "../commons/hooks"

export default class Provider {

  method: string
  middleware: Function
  hooksGroup: HooksGroup

  constructor(
    method: string,
    middleware: Function,
    hooksGroup: HooksGroup = new HooksGroup()
  ) {
    this.method = method
    this.middleware = middleware
    this.hooksGroup = hooksGroup
  }

  /**
   * Get all middlewares in order of execution.
   * @returns [Function<req, res, next>] array of valid middlewares
   */
  getMiddlewares() {
    const args = []

    if (this.hooksGroup.before.length > 0) args.push(... this.hooksGroup.before)
  
    if (typeof this.middleware === 'function') args.push(this.middleware)

    if (this.hooksGroup.after.length > 0) args.push(... this.hooksGroup.after)

    return args;
  }

}
