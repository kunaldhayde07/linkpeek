export {
  AppError,
  ValidationError,
  InvalidUrlError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  RateLimitError,
  FetchError,
  PlaywrightError,
  DuplicateError,
  isAppError,
} from "./api-error";
export type { ErrorCode } from "./api-error";

export { successResponse, errorResponse, withRateLimitHeaders } from "./api-response";
export type { ApiResponse, ApiSuccessResponse, ApiErrorResponse, ApiResponseMeta } from "./api-response";

export { withApiAuth, withSessionOrApiAuth, authenticateApiRequest, getSessionUser } from "./api-middleware";

export type {
  ApiContext,
  RateLimitResult,
  PaginationParams,
  PaginatedResponse,
} from "./api.types";
