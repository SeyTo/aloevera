import { Mongoose, Document, Model } from "mongoose"

const modelName: string = 'client'
const collection: string = 'clients'

export function createModel (app: AloeVera) {
  const mongooseClient: Mongoose = app.get('mongooseClient')

  // TODO schema definition
  const schema = new mongooseClient.Schema(
    {
      email: { type: 'string', unique: true, lowercase: true, index: true },
      password: { type: 'string' }
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

/**
 * Get/Create the mongoose Model for client.
 */
export function getModel(app: AloeVera): Model<Document> {
  const mongooseClient = app.get('mongooseClient')

  if (mongooseClient.modelNames().includes(modelName)) {
    return mongooseClient.model(modelName) as Model<Document>
  } else {
    return createModel(app)
  }

}
