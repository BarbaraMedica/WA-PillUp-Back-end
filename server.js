import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cron from "node-cron";

import Terapija from "./modeli/Terapija.js";
import { sendEmail } from "./servisi/emailService.js";

import autentikacijaRuta from "./rute/autentikacijaRuta.js";
import lijekoviRuta from "./rute/lijekoviRuta.js";
import raspolozenjaRuta from "./rute/raspolozenjaRuta.js";
import korisnikRuta from "./rute/korisnikRuta.js";
import terapijaRuta from "./rute/terapijaRuta.js";

// Učitavanje .env
dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

//logger
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});


mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log(" MongoDB spojen"))
  .catch((err) => console.error(" MongoDB greška:", err));


app.use("/api/autentikacija", autentikacijaRuta);
app.use("/api/lijekovi", lijekoviRuta);
app.use("/api/raspolozenja", raspolozenjaRuta);
app.use("/api/korisnik", korisnikRuta);
app.use("/api/terapije", terapijaRuta);

app.get("/", (req, res) => {
  res.send("PillUp backend radi!");
});

//podsjetnik
cron.schedule("* * * * *", async () => {
  try {
    const sada = new Date();
    const vrijeme = sada.toTimeString().slice(0, 5);

    const terapije = await Terapija.find({
      vremenaUzimanja: vrijeme,
      aktivna: true
    }).populate("korisnik lijek");

    for (const t of terapije) {
      await sendEmail(
        t.korisnik.email,
        "Vrijeme za lijek",
        `Vrijeme je za uzeti lijek ${t.lijek.naziv}`
      );
    }
  } catch (error) {
    console.error("Cron greška:", error);
  }
});


app.use((req, res) => {
  res.status(404).json({ msg: "Ruta nije pronađena" });
});


app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(err.status || 500).json({
    msg: err.msg || "Greška na serveru",
    error:
      process.env.NODE_ENV === "development"
        ? err.message
        : undefined
  });
});


const PORT = process.env.PORT || 4000;

app.listen(PORT, () =>
  console.log(` Server pokrenut na portu ${PORT}`)
);
