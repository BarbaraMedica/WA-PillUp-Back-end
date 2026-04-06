import mongoose from "mongoose";
import bcrypt from "bcrypt";

const korisnikSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    lozinka: {
      type: String,
      required: true,
      minlength: 6
    },
    ime: {
      type: String,
      trim: true
    },
    postavke: {
      notifikacije: {
        type: Boolean,
        default: true
      },
      podsjetnici: {
        type: Boolean,
        default: true
      }
    },
    uloga: {
      type: String,
      enum: ["user", "admin"],
      default: "user"
    },
    isVerified: {
      type: Boolean,
      default: false
    },
    verificationToken: String,
    resetToken: String,
    resetTokenExpiry: Date
  },
  { timestamps: true }
);

// hash lozinke
korisnikSchema.pre("save", async function () {
  if (!this.isModified("lozinka")) return;

  try {
    const salt = await bcrypt.genSalt(10);
    this.lozinka = await bcrypt.hash(this.lozinka, salt);
  } catch (err) {
    throw err;
  }
});


korisnikSchema.methods.provjeriLozinku = async function (lozinka) {
  return bcrypt.compare(lozinka, this.lozinka);
};

export default mongoose.model("Korisnik", korisnikSchema);
