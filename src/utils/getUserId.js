import jwt from "jsonwebtoken";

const getUserId = (request, requireAuth = true) => {
  const header = request.request
    ? request.request.headers.authorization
    : request.connection.context.Authorization;

  if (header) {
    const token = header.replace("Bearer ", "");
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      return decoded.userId;
    } catch (err) {
      const message =
        err.name === "TokenExpiredError"
          ? "Session timeout"
          : "Invalid Authentication";

      if (requireAuth) {
        throw new Error(message);
      }
      return null;
    }
  }

  if (requireAuth) {
    throw new Error("Authentication required!");
  }

  return null;
};

export default getUserId;
