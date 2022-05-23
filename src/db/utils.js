import db, { getTableName } from "@/core/dynamodb";

export const promisify = (cb, transform) => {
  return new Promise((resolve, reject) => {
    cb((err, data) => {
      if (err) return reject(err);

      // case Delete: data will be null
      if (!data)
        return resolve({
          Items: []
        });

      let Items = [];

      // case Create [] data is array Model
      if (Array.isArray(data)) {
        data.map(item => item.attrs && Items.push(item.attrs));
      }
      // case Scan: data.Items is array
      else if (Array.isArray(data.Items)) {
        Items = data.Items.map(itm => itm.attrs);
      }
      // case Insert/Update: data is a Model object
      else if (data.attrs) {
        Items.push(data.attrs);
      }

      const { Count, ScannedCount, LastEvaluatedKey } = data;
      const res = {
        Items,
        Count,
        ScannedCount,
        LastEvaluatedKey
      };
      transform = transform ? transform : res => res;
      return resolve(transform(res));
    });
  });
};

/**
 * 
 * @param { modelName, hashKey, rangeKey, timestamps, schema, indexes, tableName } params 
 */
export const defineTable = (params =  {}) => {
  params.tableName = params.tableName || getTableName(modelName);
  const model = db.define(modelName, params);

  model.runQuery = async (query) => promisify(cb => query.exec(cb));
  
  model.findByPk = async (pk, attributes = []) => {
    return promisify(cb => {
      const options = {};
      if (attributes.length > 0) Object.assign(options, { AttributesToGet: attributes });
      return model.get(pk, options, cb);
    });
  };
  return model;
};

