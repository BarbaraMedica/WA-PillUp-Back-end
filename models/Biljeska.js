import mongoose from "mongoose";

const BiljeskaSchema = new mongoose.Schema({
  korisnik: { type: mongoose.Schema.Types.ObjectId, ref: "Korisnik", required: true },
  lijek_id: { type: mongoose.Schema.Types.ObjectId, ref: "Lijek", required: true },
  vrsta: { type: String, enum: ["djelotvornost", "nuspojave", "biljeska"], required: true },
  tekst: { type: String, required: true },
}, { timestamps: true });

export default mongoose.model("Biljeska", BiljeskaSchema);