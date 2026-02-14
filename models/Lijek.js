import mangoose from "mongoose";
import Korisnik from "./Korisnik.js";

export const lijekSchema = new mongoose.Schema(
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
export default mongoose.model("Lijek", lijekSchema);

