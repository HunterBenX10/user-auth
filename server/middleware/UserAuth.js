// Find token from cookie and from token userId

import jwt from "jsonwebtoken";

const userAuth = (req, res, next) => {
  const auth = req.headers.authorization || "";
  const bearer = auth.startsWith("Bearer ") ? auth.slice(7).trim() : null;
  const token = req.cookies?.token || bearer || req.headers["x-access-token"];

  if (!token || typeof token !== "string") {
    return res
      .status(401)
      .json({ success: false, message: "Not Authorized. Login Again" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded?.id) {
      return res
        .status(401)
        .json({ success: false, message: "Not Authorized. Invalid token" });
    }
    req.userId = decoded.id;
    next();
  } catch {
    return res
      .status(401)
      .json({ success: false, message: "Not Authorized. Invalid token" });
  }
};

export default userAuth;
