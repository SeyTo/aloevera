export default class HooksGroup {
  before: HookFun[] 
  after: HookFun[] 

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
