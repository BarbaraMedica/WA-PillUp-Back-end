import express from "express";
import { body, validationResult } from "express-validator";
import { registracija, prijava } from "../controllers/autentifikacijaController.js";
import { registracijaValidator } from "../validators/autentifikacijaValidator.js";
import { verifyEmail } from "../controllers/autentifikacijaController.js";

const router = express.Router();

// REGISTRACIJA
router.post(
  "/registracija",
  registracijaValidator,
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
  registracija
);

// PRIJAVA
router.post("/prijava", 
  body('email').isEmail(),
  body('lozinka').notEmpty(),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
  prijava
);
router.get("/verify/:token", verifyEmail);

export default router;