const UserModel = require("../model/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

async function register(req, res) {
  const data = await req.body;
  if (!data.username || !data.email || !data.first_name || !data.last_name || !data.password || !data.password_confirm) {
    return res.status(400).send({ message: "Form isian tidak boleh kosong" });
  }
  if (data.password !== data.password_confirm) {
    return res.status(400).send({ message: "konfirmasi sandi berbeda" });
  }

  const isUserExists = await UserModel.exists({ email: data.email }).exec();
  if (isUserExists) {
    return res.status(400).send({ message: "Email itu sudah dipakai" });
  }
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(data.password, salt);
  try {
    await UserModel.create({
      username: data.username,
      email: data.email,
      first_name: data.first_name,
      last_name: data.last_name,
      password: hashedPassword,
    });
    return res.status(201).send({ message: "Pendaftaran berhasil!" });
  } catch (error) {
    console.log(error);
  }
}
async function login(req, res) {
  const data = req.body;
  if (!data.email || !data.password) {
    return res.status(400).send({ message: "Form isian tidak boleh kosong" });
  }
  const isUserExists = await UserModel.findOne({ email: data.email }).exec();
  if (!isUserExists) {
    return res.status(400).send({ message: "Akun dengan email itu tidak ada" });
  }
  const isPassCorrect = await bcrypt.compare(data.password, isUserExists.password);
  if (!isPassCorrect) return res.status(400).send({ message: "Email atau Kata sandi salah" });
  try {
    const accessToken = jwt.sign(
      {
        id: isUserExists.id,
      },
      process.env.JWT_ACCESS,

      {
        expiresIn: "1h",
      }
    );
    const refreshToken = jwt.sign(
      {
        id: isUserExists.id,
      },
      process.env.JWT_REFRESH,
      {
        expiresIn: "1d",
      }
    );
    isUserExists.refresh_token = refreshToken;
    await isUserExists.save();
    res.cookie("refresh_token", refreshToken, { httpOnly: true, maxAge: 24 * 60 * 60 * 1000, sameSite: "None", secure: true });
    return res.status(200).send({ access_token: accessToken });
  } catch (error) {
    console.log(error);
  }
}

async function logout(req, res) {
  const cookies = req.cookies;
  if (!cookies.refresh_token) return res.status(204).send({ message: "refresh token tidak valid" });
  const isUserExists = await UserModel.findOne({ refresh_token: cookies.refresh_token }).exec();
  if (!isUserExists) {
    res.clearCookie("refresh_token", { httpOnly: true, sameSite: "None", secure: true });
    return res.status(204).send({ message: "akun tidak ditemukan, mungkin refresh token terhapus atau ter-reset" });
  }
  isUserExists.refresh_token = null;
  await isUserExists.save();

  res.clearCookie("refresh_token", { httpOnly: true, sameSite: "None", secure: true });
  return res.status(200).send({ message: "Sampai jumpa lagi!" });
}

async function refresh(req, res) {
  const cookies = req.cookies;
  if (!cookies.refresh_token) return res.status(403).send({ message: "Kamu tidak punya akses ke sini1" });
  const isUserExists = await UserModel.findOne({ refresh_token: cookies.refresh_token }).exec();
  if (!isUserExists) {
    return res.status(403).send({ message: "Kamu tidak punya akses ke sini2" });
  }
  jwt.verify(cookies.refresh_token, process.env.JWT_REFRESH, (err, decoded) => {
    if (err || decoded.id !== isUserExists.id) {
      return res.status(403).send({ message: "Kamu tidak punya akses ke sini3" });
    }
    const newAccessToken = jwt.sign(
      {
        id: decoded.id,
      },
      process.env.JWT_ACCESS,
      {
        expiresIn: "1800s",
      }
    );
    return res.status(200).send({ access_token: newAccessToken });
  });
}
async function getUser(req, res) {
  const userProfile = req.user;
  return res.status(201).send(userProfile);
}
module.exports = { register, login, logout, refresh, getUser };
