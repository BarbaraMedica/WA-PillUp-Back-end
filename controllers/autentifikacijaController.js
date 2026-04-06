import Korisnik from "../models/Korisnik.js";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { sendEmail } from "../services/emailService.js";

async function registracija(req, res, next) {
  try {
    console.log("Počela registracija za email:", req.body.email);
    
    const { email, lozinka } = req.body;

    if (!email || !lozinka) {
      return res.status(400).json({ errors: [{ msg: "Email i lozinka su obavezni" }] });
    }

    const postoji = await Korisnik.findOne({ email });
    if (postoji) {
      console.log("Korisnik već postoji:", email);
      return res.status(400).json({ msg: "Korisnik već postoji" });
    }

    // token dodan
    const verificationToken = crypto.randomBytes(32).toString("hex");

    const korisnik = new Korisnik({ email, lozinka, verificationToken, isVerified: false });
    await korisnik.save();
    
    console.log("Korisnik spremljen u bazu:", email);

    res.status(201).json({ msg: "Registracija uspješna" });

    // Email se šalje u pozadini 
    const verifyUrl = `${process.env.BASE_URL}/api/autentikacija/verify/${verificationToken}`;
    setImmediate(() => {
      sendEmail(
        email,
        "PillUp - Potvrdi svoju email adresu",
        `Dobrodošao/la u PillUp!\n\nPotvrdi svoju email adresu klikom na ovaj link:\n${verifyUrl}\n\nLink vrijedi 24 sata.`
      ).then(() => {
        console.log("Email uspješno poslan za:", email);
      }).catch(err => {
        console.error("Greška pri slanju emaila za", email, ":", err.message);
      });
    });

  } catch (err) {
    console.error("Greška pri registraciji:", err.message);
    
    // Ako je validation error
    if (err.name === "ValidationError") {
      const messages = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({ errors: [{ msg: messages.join(", ") }] });
    }
  
    if (err.code === 11000) {
      return res.status(400).json({ errors: [{ msg: "Email je već registriran" }] });
    }
    
    res.status(500).json({ errors: [{ msg: "Greška na serveru" }] });
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
