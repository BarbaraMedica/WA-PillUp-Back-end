import mongoose from "mongoose";

const uzimanjeSchema = new mongoose.Schema(
  {
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
    datum: {
      type: Date,
      required: true
    },
    vrijeme: {
      type: String, // "08:00"
      required: true
    },
    status: {
      type: String,
      enum: ["uzet", "preskocen"],
      required: true
    }
  },
  { timestamps: true }
);

export default mongoose.model("UzimanjeLijeka", uzimanjeSchema);
