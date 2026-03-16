import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cron from "node-cron";

import Terapija from "./models/Terapija.js";
import { sendEmail } from "./services/emailService.js";
import UzimanjeLijeka from "./models/UzimanjeLijeka.js";
import Biljeska from "./models/Biljeska.js";


import autentikacijaRuta from "./rute/autentikacijaRuta.js";
import izvjestajRuta from "./rute/izvjestajRuta.js";
import lijekoviRuta from "./rute/lijekoviRuta.js";
import raspolozenjaRuta from "./rute/raspolozenjaRuta.js";
import korisnikRuta from "./rute/korisnikRuta.js";
import terapijaRuta from "./rute/terapijaRuta.js";
import statistikaRuta from "./rute/statistika.js";
import biljeskeRuta from "./rute/biljeskeRuta.js";

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
app.use("/api/izvjestaji", izvjestajRuta);
app.use("/api/statistika", statistikaRuta);
app.use("/api/biljeske", biljeskeRuta);
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

      if (!t.korisnik.postavke?.notifikacije) continue;

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

cron.schedule("59 23 * * *", async () => {
  try {
    const danas = new Date();
    danas.setHours(0, 0, 0, 0);

    const terapije = await Terapija.find({
      aktivna: true
    });

    for (const terapija of terapije) {

      for (const vrijeme of terapija.vremenaUzimanja) {

        const postoji = await UzimanjeLijeka.findOne({
          korisnik: terapija.korisnik,
          terapija: terapija._id,
          datum: { $gte: danas },
          vrijeme
        });

        if (!postoji) {
          await UzimanjeLijeka.create({
            korisnik: terapija.korisnik,
            terapija: terapija._id,
            datum: new Date(),
            vrijeme,
            status: "preskočen"
          });
        }
      }
    }

  } catch (error) {
    console.error("Daily cron greška:", error);
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
