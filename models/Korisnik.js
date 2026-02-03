const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const KorisnikSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true },
    lozinka: { type: String, required: true },
    ime: { type: String },
    postavke: {
      notifikacije: { type: Boolean, default: true },
      podsjetnici: { type: Boolean, default: true }
    },
    uloga: {
      type: String,
      enum: ["user", "admin"],
      default: "user"
    }
  },
  { timestamps: true }
);

// hash lozinke prije spremanja
KorisnikSchema.pre("save", async function () {
  if (!this.isModified("lozinka")) return;
  try {
    const salt = await bcrypt.genSalt(10);
    this.lozinka = await bcrypt.hash(this.lozinka, salt);
  } catch (error) {
    throw error;
  }
});

KorisnikSchema.methods.provjeriLozinku = async function (lozinka) {
  return await bcrypt.compare(lozinka, this.lozinka);
};

module.exports = mongoose.model("Korisnik", KorisnikSchema);
