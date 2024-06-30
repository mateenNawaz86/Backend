// custom error class for handling API errors
class ApiError extends Error {
  constructor(
    statusCode,
    message = "Something went wrong!",
    errors = [],
    stack = ""
  ) {
    super(message); // Call the parent class (Error) constructor with the message
    this.statusCode = statusCode; // HTTP status code
    this.message = message; // Error message
    this.data = null; // Additional data (initialized to null)
    this.errors = errors; // Array of error details

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

export { ApiError };
