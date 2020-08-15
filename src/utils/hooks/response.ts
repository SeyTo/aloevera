import {Response, NextFunction} from "express";

export function mSuccess (req: Request, res: Response, _next: NextFunction) {
  if (req.ref.success === true) {
    res.status(200).send('finish')
  } else {
    res.status(501).send('something went wrong')
  }
}

export function mSuccessData (req: Request, res: Response, _next: NextFunction) {
  if (req.ref.success === true) {
    res.status(200).send(req.ref.result)
  } else {
    res.status(501).send('something went wrong')
  }
}

export function mResponse (req: Request, res: Response, _next: NextFunction) {
  if (req.ref.success === true) {
    res.status(req.ref.status || 200).send(req.ref.result)
  } else {
    res.status(req.ref.status || 501).send(req.ref.result || 'Something went wrong')
  }
}
