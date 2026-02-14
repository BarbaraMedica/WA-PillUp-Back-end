import mongoose from "mongoose";
import Korisnik from "./Korisnik.js";
import Lijek from "./Lijek.js";

const terapijaSchema = new mongoose.Schema({
  korisnik: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Korisnik",
    required: true
  },
  lijek: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Lijek",
    required: true
  },
  doza: {
    type: String,
    required: true
  },
  vremenaUzimanja: [{
    type: String,
    required: true
  }],
  datumPocetka: {
    type: Date,
    required: true
  },
  datumKraja: Date,
  aktivna: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

export default mongoose.model("Terapija", terapijaSchema);
