const sendResponse = (res, statusCode, message, data = null) => {
    res.status(statusCode).json({
      code: statusCode === 200 || statusCode === 201 ? 0 : 1,
      msg: message,
      data
    });
  };
  module.exports = { sendResponse };