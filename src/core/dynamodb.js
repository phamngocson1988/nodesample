import dynamo from 'dynamodb';

const configs = {
  region: process.env.REGION
};
dynamo.AWS.config.update(configs);
export default dynamo;
export const getTableName = (modelName) => {
  return `${modelName}-${process.env.STAGE}-${process.env.DB_VERSION}`;
}
