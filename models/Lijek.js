const mongoose = require("mongoose");

const lijekSchema = new mongoose.Schema(
  {
    korisnik: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Korisnik",
      required: true
    },
    ime: { type: String, required: true },
    doza: String,
    vrijeme: String,
    nacin: String,
    kolicina: Number,
    trajanje: Number,
    preostalo: Number,
    podsjetnik: { type: Boolean, default: false }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Lijek", lijekSchema);
