"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = void 0;
const errors_1 = require("../utils/errors");
const validate = (schema) => {
    return async (req, res, next) => {
        try {
            await schema.parseAsync({
                body: req.body,
                query: req.query,
                params: req.params,
            });
            next();
        }
        catch (error) {
            if (error instanceof Error) {
                next(new errors_1.ValidationError(error.message));
            }
            else {
                next(new errors_1.ValidationError('Invalid request data'));
            }
        }
    };
};
exports.validate = validate;
