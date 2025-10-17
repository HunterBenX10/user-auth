// Find token from cookie and from token userId

import jwt from "jsonwebtoken";

const UserAuth = (req, res, next) => {
  const token = req.cookies;

  if (!token) {
    return res.json({
      success: false,
      message: "Not Authorized. Invalid token",
    });
  }
  try {
    const tokenDecoded = jwt.verify(token, process.env.JWT_SECRET);

    if (tokenDecoded.id) {
      req.body = tokenDecoded.id;
    } else {
      return res.json({
        success: false,
        message: "Not Authorized. Invalid token",
      });
    }

    next();
  } catch (error) {
    return res.json({
      success: false,
      message: "Not Authorized. Invalid token",
    });
  }
};

export default UserAuth;
