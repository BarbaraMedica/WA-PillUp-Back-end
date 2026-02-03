const express = require("express");
const router = express.Router();
const { registracija, prijava } = require("../controllers/autentifikacijaController");
const { registracijaValidator } = require("../validators/autentifikacijaValidator");
const { body, validationResult } = require("express-validator");

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

module.exports = router;
