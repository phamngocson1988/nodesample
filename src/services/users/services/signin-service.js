import * as userDB from "@/db/user";
import { generateJWT } from "@/libs/jwt";
import BaseModel from "@/libs/base-model";
import bcrypt from "bcryptjs";

/**
 * { email, password}
 */
export class SigninService extends BaseModel {
    constructor(params = {}) {
        super(params);
        this.rules = {
            email: 'validateEmail',
            password: 'validatePassword'
        };

        /** User */
        this._user = null;
    }

    async validateEmail(attribute) {
        if (!this[attribute]) {
            return this.addError(attribute, `${attribute}_is_required`);
        }
        const user = await this.getUser();
        if (!user) {
            return this.addError(attribute, 'user_is_not_exist');
        }
    }

    async validatePassword(attribute) {
        const password = this[attribute] || '';
        if (!password) {
            return this.addError(attribute, `${attribute}_is_required`);
        }
        const user = await this.getUser();
        if (!bcrypt.compareSync(password, user.hash)) {
            return this.addError(attribute, `${attribute}_is_wrong`);
        }
    }

    async getUser() {
        if (!this._user) {
            this._user = await userDB.findByEmail(this.email);
        }
        return this._user;
    }

    async process() {
        const validate = await this.validate();
        if (!validate) {
            return false;
        }
        const user = await this.getUser();
        const token = generateJWT(userDB.protectUser(user));
        return token;
        
    }
}