import mongoose from "mongoose";

const UzimanjeLijekaSchema = new mongoose.Schema({
  korisnik: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  lijek: { type: mongoose.Schema.Types.ObjectId, ref: "Lijek", required: true },
  datum: { type: Date, required: true }, 
  vrijeme: { type: String, required: true }, 
  vrijemeUzimanja: { type: Date }, // stvarno vrijeme uzimanja
  status: { 
    type: String, 
    enum: ["na_vrijeme", "kasno", "preskoceno"], 
    default: null 
  }
});

export default mongoose.model("UzimanjeLijeka", UzimanjeLijekaSchema);