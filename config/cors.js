const allowedOrigin = ["http://localhost:8000", "http://localhost:8080", "http://localhost:5173"];
const corsOption = {
  origin: (origin, callback) => {
    if (allowedOrigin.includes(origin) || !origin) {
      callback(null, true);
    } else {
      callback(new Error("cors melarang kamu masuk"));
    }
  },
};

module.exports = corsOption;
