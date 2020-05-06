import { Mongoose } from "mongoose"

const modelName: string = 'transaction'
const collection: string = 'transactions'

export function createModel (app: AloeVera) {
  const mongooseClient: Mongoose = app.get('mongooseClient')

  // TODO schema definition
  const schema = new mongooseClient.Schema(
    {
      name: { type: 'string', unique: true, lowercase: true, index: true }
    },
    {
      collection, timestamps: true
    }
  )

  // TODO methods ??
  // TODO statics ??
  // TODO plugins ??

  if (mongooseClient.modelNames().includes(modelName)) {
    // why is there no deleteModel!
    // @ts-ignore
    mongooseClient.deleteModel(modelName)
  }
  return mongooseClient.model(modelName, schema);
}

export function getModel(app: AloeVera): any | void {
  const mongooseClient = app.get('mongooseClient')
  
  if (mongooseClient.modelNames().includes(modelName)) {
    return mongooseClient.model(modelName)
  } else {
    return createModel(app)    
  }

}

