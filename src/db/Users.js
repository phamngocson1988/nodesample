import db, { getTableName } from "@/core/dynamodb";
import Joi from 'joi';
import { promisify, defineTable } from './utils';

const modelName = 'Users';
const hashKey = 'id';
const schema = {
  id: Joi.string().required(),
  email: Joi.string().required(),
  hash: Joi.string().required(),
};
const indexes = [
  {
    hashKey: 'email',
    rangeKey: 'id',
    name: 'email-id-index',
    type: 'global'
  }
];

const model = defineTable({ modelName, hashKey, timestamps: true, schema, indexes });
export default model;
