import {NextFunction} from "express";
import LocalService from "./service";

export function extractParam (req: Request, res: Response, next: NextFunction) {
  throw new Error('Not implmentated')
}

export async function verify(req: Request, res: Response, next: NextFunction) {
  await (req.ref.service as LocalService).authenticate({ user: "", password: "" })
}
