export const createError = (status, message) => {
    return {
        success: "error",
        status,
        message
    };
};
  