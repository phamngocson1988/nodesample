import * as userDB from "@/db/user";
import { generatePushId } from "@/libs/generatePushId";
import BaseModel from "@/libs/base-model";
import bcrypt from "bcryptjs";

/**
 * { email, password}
 */
export class SignupService extends BaseModel {
    constructor(params = {}) {
        super(params);
        this.rules = {
            email: 'require',
            password: 'require'
        };
    }

    require(attribute) {
        if (!this[attribute]) {
            this.addError(attribute, `${attribute}_is_required`);
        }
    }

    async process() {
        const validate = await this.validate();
        if (!validate) {
            return false;
        }
        const { email, password } = this;
        const id = generatePushId();
        const hash = bcrypt.hashSync(password);
        const user = await userDB.create({ id, email, hash });
        return userDB.protectUser(user);
    }
}