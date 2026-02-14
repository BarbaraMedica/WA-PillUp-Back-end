import { body } from "express-validator";

export const registracijaValidator = [
  body("email")
    .isEmail()
    .withMessage("Email nije ispravnog formata"),
  body("lozinka")
    .isLength({ min: 6 })
    .withMessage("Lozinka mora imati barem 6 znakova")
];
