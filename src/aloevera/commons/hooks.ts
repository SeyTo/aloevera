export default class HooksGroup {
  before: HookFun[]
  after: HookFun[] 

  /**
   * @param before Function[] (req, res, next) type of function.
   * @param after Function[] (req, res, next) type of function.
   */
  constructor(before = [], after = []) {
    this.before = before
    this.after = after
  }
}

export class HookFun {
  middleware: any

  constructor(middleware: any)  {
    this.middleware = middleware
  }
}
