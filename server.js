const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });

const autentikacijaRuta = require("./rute/autentikacijaRuta");
const lijekoviRuta = require("./rute/lijekoviRuta");
const raspolozenjaRuta = require("./rute/raspolozenjaRuta");
const korisnikRuta = require("./rute/korisnikRuta");

const app = express();
app.use(cors());
app.use(express.json());

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

app.get("/", (req, res) => {
  res.send("PillUp backend radi!");
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(` Server pokrenut na portu ${PORT}`));
