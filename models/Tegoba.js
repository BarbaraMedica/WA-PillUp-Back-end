import mongoose from "mongoose";

const tegobaSchema = new mongoose.Schema(
  {
    korisnik: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Korisnik",
      required: true
    },
    datum: { type: Date, default: Date.now },
    tegoba: { type: String, required: true }
  },
  { timestamps: true }
);

export default mongoose.model("Tegoba", tegobaSchema);