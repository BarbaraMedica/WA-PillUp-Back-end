const mongoose = require("mongoose");

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

module.exports = mongoose.model("Raspoloženje", raspolozenjeSchema);
