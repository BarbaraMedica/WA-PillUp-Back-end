import Korisnik from "../models/Korisnik.js";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { sendEmail } from "../services/emailService.js";

async function registracija(req, res, next) {
  try {
    const { email, lozinka } = req.body;

    const postoji = await Korisnik.findOne({ email });
    if (postoji) {
      return res.status(400).json({ msg: "Korisnik već postoji" });
    }

    // token dodan
    const verificationToken = crypto.randomBytes(32).toString("hex");

    const korisnik = new Korisnik({ email, lozinka, verificationToken, isVerified: false });
    await korisnik.save();

    // i slanje maila
    const verifyUrl = `${process.env.BASE_URL}/api/autentikacija/verify/${verificationToken}`;
    await sendEmail(
      email,
      "PillUp - Potvrdi svoju email adresu",
      `Dobrodošao/la u PillUp!\n\nPotvrdi svoju email adresu klikom na ovaj link:\n${verifyUrl}\n\nLink vrijedi 24 sata.`
    );

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

    const token = jwt.sign(
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

export { registracija, prijava, verifyEmail };
