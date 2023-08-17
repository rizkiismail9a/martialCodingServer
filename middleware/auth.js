function auth(req, res, next) {
  if (req.user?.id) {
    return next();
  } else {
    return res.status(401).send({ message: "Kamu tidak punya akses ke sini" });
  }
}
module.exports = auth;
