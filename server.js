import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import 'dotenv/config';
import cron from "node-cron";


import Terapija from "./models/Terapija.js";
import Lijek from "./models/Lijek.js";
import Korisnik from "./models/Korisnik.js";
import { sendEmail } from "./services/emailService.js";
import UzimanjeLijeka from "./models/UzimanjeLijeka.js";
import Raspolozenje from "./models/Raspolozenje.js";
import Tegoba from "./models/Tegoba.js";

import autentikacijaRuta from "./rute/autentikacijaRuta.js";
import izvjestajRuta from "./rute/izvjestajRuta.js";
import lijekoviRuta from "./rute/lijekoviRuta.js";
import raspolozenjaRuta from "./rute/raspolozenjaRuta.js";
import korisnikRuta from "./rute/korisnikRuta.js";
import terapijaRuta from "./rute/terapijaRuta.js";
import statistikaRuta from "./rute/statistika.js";
import biljeskeRuta from "./rute/biljeskeRuta.js";
import analizaRoutes from "./rute/analiza.js";
import tegobeRuta from "./rute/tegobeRuta.js";
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
app.use("/api/izvjestaj", izvjestajRuta);
app.use("/api/statistika", statistikaRuta);
app.use("/api/biljeske", biljeskeRuta);
app.use("/api/analiza", analizaRoutes);
app.use("/api/tegobe", tegobeRuta);
app.get("/", (req, res) => {
  res.send("PillUp backend radi!");
});

// Test email - ONEMOGUĆENO
// (async () => {
//   await sendEmail(
//     "barbi.medica@gmail.com",
//     "Test SendGrid",
//     "Ovo je test mail poslan preko SendGrid i Nodemailer!"
//   );
// })();

//podsjetnik - svaku minutu provjeri trebali bi li se poslati mailovi
cron.schedule("* * * * *", async () => {
  try {
    const sada = new Date();
    const vrijeme = sada.toTimeString().slice(0, 5); // HH:MM format

    console.log(` [${sada.toISOString()}] Provjera mailova za vrijeme: ${vrijeme}`);

    // Koristi Lijek model sa podsjetnik flagom
    const lijekovi = await Lijek.find({
      vrijeme: vrijeme,
      podsjetnik: true
    }).populate("korisnik");

    console.log(` Pronađeni lijekovi s podsjetnicima na vrijeme ${vrijeme}: ${lijekovi.length}`);

    for (const lijek of lijekovi) {
      if (!lijek.korisnik) {
        console.log(`  Lijek ${lijek.ime} nema povezanog korisnika`);
        continue;
      }

      // Provjeri da li korisnik ima omogućene podsetnike
      const podsjetnici = lijek.korisnik.postavke?.podsjetnici !== false;
      
      if (!podsjetnici) {
        console.log(`  Korisnik ${lijek.korisnik.email} ima onemogućene podsetnike`);
        continue;
      }

      console.log(` Slanje maila korisniku ${lijek.korisnik.email} za lijek ${lijek.ime}`);
      
      const emailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #06b6d4; color: white; padding: 20px; border-radius: 8px 8px 0 0; text-align: center;">
            <h1 style="margin: 0; font-size: 28px;">🔔 PillUp Podsjetnik</h1>
          </div>
          
          <div style="background-color: #f0f9ff; padding: 30px; border: 1px solid #e0f2fe;">
            <p style="font-size: 16px; color: #1e293b;">Pozdrav <strong>${lijek.korisnik.ime}</strong>,</p>
            
            <p style="font-size: 16px; color: #1e293b; margin: 20px 0;">Vrijeme je: <strong style="color: #0891b2; font-size: 20px;">${vrijeme}</strong></p>
            
            <div style="background-color: white; border-left: 4px solid #06b6d4; padding: 15px; margin: 20px 0; border-radius: 4px;">
              <p style="margin: 5px 0;"><strong>Lijek:</strong> ${lijek.ime}</p>
              <p style="margin: 5px 0;"><strong>Doza:</strong> ${lijek.doza}</p>
              <p style="margin: 5px 0;"><strong>Način:</strong> ${lijek.nacin}</p>
            </div>
            
            <p style="font-size: 18px; color: #0891b2; margin: 20px 0;"><strong>Nemoj zaboraviti! 💊</strong></p>
            
            <p style="font-size: 14px; color: #64748b; margin-top: 30px;">
              Ovaj email je automatski poslan od <strong>PillUp - Tvoj pomoćnik za praćenje lijekova</strong>
            </p>
          </div>
          
          <div style="background-color: #e2e8f0; padding: 15px; text-align: center; font-size: 12px; color: #475569; border-radius: 0 0 8px 8px;">
            <p style="margin: 5px 0;">Ne odgovori na ovaj email - koristi aplikaciju PillUp za bilo koja pitanja</p>
          </div>
        </div>
      `;
      
      await sendEmail(
        lijek.korisnik.email,
        "🔔 Vrijeme za lijek - PillUp Podsjetnik",
        emailHtml,
        true // HTML email
      );
    }

  } catch (error) {
    console.error("❌ Cron greška pri slanju mailova:", error);
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
          lijek: terapija.lijek,
          korisnik: terapija.korisnik,
          datum: { $gte: danas },
          vrijeme
        });

        if (!postoji) {
          await UzimanjeLijeka.create({
            lijek: terapija.lijek,
            korisnik: terapija.korisnik,
            datum: new Date(),
            vrijeme,
            status: "preskocen"
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
