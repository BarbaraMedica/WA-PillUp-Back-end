const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });

const autentikacijaRuta = require("./rute/autentikacijaRuta");
const lijekoviRuta = require("./rute/lijekoviRuta");
const raspolozenjaRuta = require("./rute/raspolozenjaRuta");
const korisnikRuta = require("./rute/korisnikRuta");
// const izvjestajRuta = require("./rute/izvjestajRuta");

const app = express();
app.use(cors());
app.use(express.json());

// Logger middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});
// MongoDB konekcija
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log(" MongoDB spojen"))
  .catch((err) => console.error(" MongoDB greška:", err));

// Rute
app.use("/api/autentikacija", autentikacijaRuta);
app.use("/api/lijekovi", lijekoviRuta);
app.use("/api/raspolozenja", raspolozenjaRuta);
app.use("/api/korisnik", korisnikRuta);
// app.use("/api/izvjestaj", izvjestajRuta);

app.get("/", (req, res) => {
  res.send("PillUp backend radi!");
});


// 404 HANDLER
app.use((req, res) => {
  res.status(404).json({ msg: "Ruta nije pronađena" });
});
app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(err.status || 500).json({ 
    msg: err.msg || "Greška na serveru",
    error: process.env.NODE_ENV === "development" ? err.message : undefined
  });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(` Server pokrenut na portu ${PORT}`));
