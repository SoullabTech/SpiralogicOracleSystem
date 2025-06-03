"use strict";
// ===============================================
// PRODUCTION ERROR HANDLING & GRACEFUL FALLBACKS
// Sacred Technology Platform Error Recovery
// ===============================================
Object.defineProperty(exports, "__esModule", { value: true });
exports.asyncHandler = exports.errorHandler = exports.ErrorType = void 0;
const errors_1 = require("@/utils/errors");
const logger_1 = require("@/utils/logger");
const config_1 = require("@/config");
var ErrorType;
(function (ErrorType) {
    ErrorType["VALIDATION"] = "validation";
    ErrorType["AUTH"] = "authentication";
    ErrorType["PERMISSION"] = "permission";
    ErrorType["NOT_FOUND"] = "not_found";
    ErrorType["DATABASE"] = "database";
    ErrorType["EXTERNAL_API"] = "external_api";
    ErrorType["MEMORY_STORAGE"] = "memory_storage";
    ErrorType["ORACLE_PROCESSING"] = "oracle_processing";
    ErrorType["RATE_LIMIT"] = "rate_limit";
    ErrorType["SYSTEM"] = "system";
})(ErrorType || (exports.ErrorType = ErrorType = {}));
// ===============================================
// GRACEFUL FALLBACK STRATEGIES
// ===============================================
class FallbackStrategy {
    static async handleDatabaseFailure(operation, context) {
        logger_1.logger.warn(`Database operation failed: ${operation}. Using fallback strategy.`, context);
        switch (operation) {
            case 'memory_store':
                return { stored: false, error: 'Storage temporarily unavailable', fallback: true };
            case 'user_profile':
                return { id: context.userId, minimal: true, fallback: true };
            case 'oracle_session':
                return { id: `temp_${Date.now()}`, temporary: true, persisted: false };
            default:
                return { error: 'Service temporarily unavailable', fallback: true };
        }
    }
    static async handleOracleProcessingFailure(userInput) {
        logger_1.logger.warn('Oracle processing failed. Using fallback response.');
        return {
            response: "I sense a disturbance in the digital realm. While I gather my sacred energies, please know that your words are heard. Try again in a moment, and the wisdom will flow.",
            mode: 'guardian',
            fallback: true,
            retryIn: 30000
        };
    }
    static async handleExternalAPIFailure(service) {
        logger_1.logger.warn(`External API failure: ${service}. Using fallback.`);
        return {
            error: `Service ${service} temporarily unavailable`,
            fallback: true,
            retryIn: 60000
        };
    }
}
// ===============================================
// ENHANCED ERROR HANDLER
// ===============================================
const errorHandler = async (error, req, res, _next) => {
    // Enhanced logging with context
    logger_1.logger.error(`[${error.name}] ${error.message}`, {
        stack: config_1.config.server.env === 'development' ? error.stack : undefined,
        url: req.url,
        method: req.method,
        userId: req.user?.id,
        timestamp: new Date().toISOString(),
        context: error.context
    });
    // Determine error type and appropriate response
    const errorType = classifyError(error);
    const statusCode = error.statusCode || getStatusCodeForErrorType(errorType);
    // Try graceful fallback
    let fallbackResponse = null;
    try {
        fallbackResponse = await handleGracefulFallback(error, req);
    }
    catch (fallbackError) {
        logger_1.logger.error('Fallback strategy failed:', fallbackError);
    }
    // Handle specific error types
    if (error instanceof errors_1.ValidationError) {
        return res.status(400).json({
            success: false,
            error: { type: 'validation', message: error.message },
            ...(fallbackResponse && { fallback: fallbackResponse })
        });
    }
    if (error instanceof errors_1.AuthenticationError) {
        return res.status(401).json({
            success: false,
            error: { type: 'authentication', message: 'Sacred authentication required' },
            ...(fallbackResponse && { fallback: fallbackResponse })
        });
    }
    if (error instanceof errors_1.AuthorizationError) {
        return res.status(403).json({
            success: false,
            error: { type: 'permission', message: 'Sacred permission required' },
            ...(fallbackResponse && { fallback: fallbackResponse })
        });
    }
    if (error instanceof errors_1.NotFoundError) {
        return res.status(404).json({
            success: false,
            error: { type: 'not_found', message: error.message },
            ...(fallbackResponse && { fallback: fallbackResponse })
        });
    }
    if (error instanceof errors_1.AppError) {
        return res.status(error.statusCode).json({
            success: false,
            error: {
                type: errorType,
                message: getClientSafeMessage(error, errorType)
            },
            ...(fallbackResponse && { fallback: fallbackResponse })
        });
    }
    // General error response with fallback
    return res.status(statusCode).json({
        success: false,
        error: {
            type: errorType,
            message: getClientSafeMessage(error, errorType),
            timestamp: new Date().toISOString()
        },
        ...(fallbackResponse && { fallback: fallbackResponse }),
        ...(config_1.config.server.env === 'development' && {
            debug: {
                originalMessage: error.message,
                stack: error.stack
            }
        })
    });
};
exports.errorHandler = errorHandler;
// ===============================================
// HELPER FUNCTIONS
// ===============================================
function classifyError(error) {
    const message = error.message.toLowerCase();
    if (message.includes('database') || message.includes('connection')) {
        return ErrorType.DATABASE;
    }
    if (message.includes('unauthorized') || message.includes('token')) {
        return ErrorType.AUTH;
    }
    if (message.includes('memory') || message.includes('storage')) {
        return ErrorType.MEMORY_STORAGE;
    }
    if (message.includes('oracle') || message.includes('divination')) {
        return ErrorType.ORACLE_PROCESSING;
    }
    if (message.includes('openai') || message.includes('api')) {
        return ErrorType.EXTERNAL_API;
    }
    if (message.includes('rate limit')) {
        return ErrorType.RATE_LIMIT;
    }
    if (message.includes('validation') || message.includes('invalid')) {
        return ErrorType.VALIDATION;
    }
    return ErrorType.SYSTEM;
}
function getStatusCodeForErrorType(errorType) {
    switch (errorType) {
        case ErrorType.VALIDATION: return 400;
        case ErrorType.AUTH: return 401;
        case ErrorType.PERMISSION: return 403;
        case ErrorType.NOT_FOUND: return 404;
        case ErrorType.RATE_LIMIT: return 429;
        default: return 500;
    }
}
function getClientSafeMessage(error, errorType) {
    switch (errorType) {
        case ErrorType.DATABASE:
            return "The sacred records are temporarily unavailable. Your data is safe.";
        case ErrorType.MEMORY_STORAGE:
            return "Memory weaving is temporarily disrupted. Please try again.";
        case ErrorType.ORACLE_PROCESSING:
            return "The oracle is gathering wisdom. Please allow a moment for deeper insight.";
        case ErrorType.EXTERNAL_API:
            return "External wisdom sources are temporarily unreachable.";
        case ErrorType.RATE_LIMIT:
            return "You're moving quickly through the sacred space. Please pause and try again.";
        case ErrorType.VALIDATION:
            return error.message;
        default:
            return "A temporary disturbance in the digital realm. Please try again.";
    }
}
async function handleGracefulFallback(error, req) {
    const errorType = classifyError(error);
    const context = {
        ...error.context,
        userId: req.user?.id,
        path: req.path
    };
    switch (errorType) {
        case ErrorType.DATABASE:
            return await FallbackStrategy.handleDatabaseFailure(error.context?.operation || 'unknown', context);
        case ErrorType.ORACLE_PROCESSING:
            return await FallbackStrategy.handleOracleProcessingFailure(error.context?.userInput || '');
        case ErrorType.EXTERNAL_API:
            return await FallbackStrategy.handleExternalAPIFailure(error.context?.service || 'unknown');
        default:
            return null;
    }
}
// ===============================================
// ASYNC ERROR WRAPPER
// ===============================================
const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};
exports.asyncHandler = asyncHandler;
