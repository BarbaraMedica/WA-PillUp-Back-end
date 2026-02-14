import Korisnik  from "../models/Korisnik";
import { sign } from "jsonwebtoken";
import crypto from "crypto";
import Korisnik from "../modeli/Korisnik.js";
import { sendEmail } from "../servisi/emailService.js";

async function registracija(req, res, next) {
  try {
    const { email, lozinka } = req.body;

    const postoji = await Korisnik.findOne({ email });
    if (postoji) {
      return res.status(400).json({ msg: "Korisnik već postoji" });
    }

    const korisnik = new Korisnik({ email, lozinka });
    await korisnik.save();

    res.status(201).json({ msg: "Registracija uspješna" });
  } catch (err) {
    next(err);
  }
}

async function prijava(req, res, next) {
  try {
    const { email, lozinka } = req.body;

    const korisnik = await Korisnik.findOne({ email });
    if (!korisnik) {
      return res.status(400).json({ msg: "Neispravni podaci" });
    }

    const isValid = await korisnik.provjeriLozinku(lozinka);
    if (!isValid) {
      return res.status(400).json({ msg: "Neispravni podaci" });
    }

    const token = sign(
      {
        id: korisnik._id,
        uloga: korisnik.uloga   
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({ token });
  } catch (err) {
    next(err);
  }
}

async function verifyEmail(req, res) {
  try {
    const korisnik = await Korisnik.findOne({
      verificationToken: req.params.token
    });

    if (!korisnik) {
      return res.status(400).json({ message: "Neispravan token" });
    }

    korisnik.isVerified = true;
    korisnik.verificationToken = undefined;

    await korisnik.save();

    res.json({ message: "Email potvrđen" });
  } catch (error) {
    res.status(500).json({ message: "Greška na serveru" });
  }
};
const token = crypto.randomBytes(32).toString("hex");

korisnik.verificationToken = token;
await korisnik.save();

await sendEmail(
  korisnik.email,
  "Potvrda emaila",
  `http://localhost:4000/api/autentikacija/verify/${token}`
);

export { registracija, prijava, verifyEmail };
