class ApiResponse {
  constructor(statusCode, data, message = "Success", errors = null) {
    this.statusCode = statusCode;
    this.data = data;
    this.message = message;
    this.success = statusCode >= 200 && statusCode < 300;
    this.errors = errors;
  }
}

export { ApiResponse };
