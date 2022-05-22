export default class BaseModel {
    /**
     * Key pair of properties which are going to be set in this object
     * @param {} params
     */
    constructor(params = {}) {
      if (params && typeof params == 'object') {
        Object.keys(params).map((key) => {
          this[key] = params[key];
        });
      }
  
      /**
       * The rules to validate properties of the object
       * @using this.validate
       * @example {property1: 'nameOfFunction1', property2: 'nameOfFunction2'}
       */
      this.rules = {};
  
      /**
       * This property is using to collect all error of each property
       * @using this.validate
       * @example {property1: ['Error 1', 'Error 2'], property2: ['Error of property 2']}
       */
      this.errors = {};
  
      /**
       * If this property is set to false, the model will validate all rules to collect all errors
       * If not, the model will stop validating if it detects any first error
       * This property is not applied for validateAsync
       * @default true
       * @using this.validate
       */
      this.stopValidateInFirstError = true;
    }
  
    addError(attribute, content = '') {
      let errors = this.errors[attribute] || [];
      errors.push(content);
      this.errors[attribute] = errors;
    }
  
    hasError() {
      return !!Object.keys(this.errors).length;
    }
  
    getErrors() {
      return this.errors || {};
    }
  
    async validate() {
      try {
        const ruleAttributes = Object.keys(this.rules) || [];
        if (!ruleAttributes.length) return true;
        for (let i = 0; i < ruleAttributes.length; i++) {
          await this._runRule(ruleAttributes[i]);
          if (this.hasError() && this.stopValidateInFirstError) {
            return false;
          }
        }
        return !this.hasError();
      } catch (error) {
        console.log('common: ', error);
        this.addError('common', error);
        return false;
      }
    }
  
    async validateAsync() {
      try {
        const ruleAttributes = Object.keys(this.rules) || [];
        if (!ruleAttributes.length) return true;
        await Promise.all(ruleAttributes.map(async (attribute) => this._runRule(attribute))).catch(
          (e) => {
            throw e;
          }
        );
        return !this.hasError();
      } catch (error) {
        console.log('baseModel.js ~ line 54 ~ BaseModel ~ validate ~ error', error);
        throw error;
      }
    }
  
    async _runRule(attribute) {
      const func = this.rules[attribute];
      if (typeof func === 'function') {
        await func(attribute);
      } else {
        await this[func](attribute);
      }
    }
  }
  