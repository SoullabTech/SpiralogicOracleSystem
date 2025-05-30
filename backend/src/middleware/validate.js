import { ValidationError } from '../utils/errors';
export const validate = (schema) => {
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
                next(new ValidationError(error.message));
            }
            else {
                next(new ValidationError('Invalid request data'));
            }
        }
    };
};
