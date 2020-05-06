import client from './client/client.service'
import { configure as auth } from './auth/auth.service'

export default function (app: AloeVera) {
  app.configure(client)
  app.configure(auth)
}
