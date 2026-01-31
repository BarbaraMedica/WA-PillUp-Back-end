const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const korisnikSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true },
    lozinka: { type: String, required: true }
  },
  { timestamps: true }
);

// hash lozinke prije save-a
korisnikSchema.pre("save", async function() {
  if (!this.isModified("lozinka")) return;
  try {
    const salt = await bcrypt.genSalt(10);
    this.lozinka = await bcrypt.hash(this.lozinka, salt);
  } catch (error) {
    throw error;
  }
});

korisnikSchema.methods.provjeriLozinku = async function (lozinka) {
  return await bcrypt.compare(lozinka, this.lozinka);
};

module.exports = mongoose.model("Korisnik", korisnikSchema);
