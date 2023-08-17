const allowedOrigin = ["http://localhost:8000", "http://localhost:8080", "http://localhost:5173"];

const credentials = (req, res, next) => {
  const origin = req.headers.origin;
  if (allowedOrigin.includes(origin)) {
    res.header("Access-Control-Allow-Origin", true);
    res.header("Access-Control-Allow-Credentials", true);
  }
  next();
};

module.exports = credentials;
