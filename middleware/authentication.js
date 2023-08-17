const jwt = require("jsonwebtoken");
const UserModel = require("../model/User");

function authentication(req, res, next) {
  const authHeader = req.headers.authorization || req.headers.Authorization;
  if (authHeader?.startsWith("Bearer")) {
    const token = authHeader.split(" ")[1];
    jwt.verify(token, process.env.JWT_ACCESS, async (err, decoded) => {
      if (err) {
        console.log(err);
        req.user = { message: "Ada yang salah1" };
        return next();
      }
      const isUserExists = await UserModel.findById(decoded.id).select({ password: 0, refresh_token: 0, __v: 0, updated_at: 0 }).exec();
      if (isUserExists) {
        req.user = isUserExists.toObject({ getters: true });
      } else {
        req.user = { message: "Ada yang salah2" };
      }
      return next();
    });
  } else {
    // console.log(new Error());
    req.user = {};
    return next();
  }
}
module.exports = authentication;
