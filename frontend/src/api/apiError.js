// Axios ki galti ko aasan roop mein badalta hai: ek message aur field-wise errors.

export function parseApiError(error) {
  // Server ne jawab diya (400, 401, 409, 500 ...)
  if (error.response) {
    const data = error.response.data || {};
    return {
      message: data.message || "Something went wrong. Please try again.",
      fieldErrors: data.errors || {},
    };
  }

  // Request gayi par jawab nahi aaya (server band hai ya internet nahi)
  if (error.request) {
    return {
      message: "Cannot reach the server. Check that the backend is running.",
      fieldErrors: {},
    };
  }

  return {
    message: "Something went wrong. Please try again.",
    fieldErrors: {},
  };
}
