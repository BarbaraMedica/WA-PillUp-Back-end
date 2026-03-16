import mongoose from "mongoose";
import Korisnik from "./Korisnik.js";

const raspolozenjeSchema = new mongoose.Schema(
  {
    korisnik: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Korisnik",
      required: true
    },
    datum: { type: Date, default: Date.now },
    raspolozenje: { type: String, required: true },
    biljeske: String
  },
  { timestamps: true }
);
export default mongoose.model("Raspolozenje", raspolozenjeSchema);
