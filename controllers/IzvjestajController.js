import Lijek from "../models/Lijek.js";
import Terapija from "../models/Terapija.js";
import Korisnik from "../models/Korisnik.js";

// Generiraj PDF izvještaj
export const generirajPDF = async (req, res) => {
  try {
    const korisnikId = req.user.id;
    const lijekovi = await Lijek.find({ korisnik: korisnikId });
    const korisnik = await Korisnik.findById(korisnikId).select("ime email");

    // Ovdje bi išla logika za generiranje PDF-a, npr. koristeći pdfkit ili puppeteer
    // Za sada vraćam JSON
    res.json({
      korisnik,
      lijekovi,
      message: "PDF izvještaj (za implementaciju)"
    });
  } catch (error) {
    res.status(500).json({ message: "Greška pri generiranju PDF-a" });
  }
};

// Dohvati uzete lijekove
export const dohvatiUžeteLijekove = async (req, res) => {
  try {
    const korisnikId = req.user.id;
    // Pretpostavimo da ima polje za uzete lijekove, za sada vraćam sve
    const lijekovi = await Lijek.find({ korisnik: korisnikId });
    res.json(lijekovi);
  } catch (error) {
    res.status(500).json({ message: "Greška pri dohvaćanju uzetih lijekova" });
  }
};

// Dohvati bilješke
export const dohvatiBilješke = async (req, res) => {
  try {
    // Pretpostavimo da ima model Bilješka, za sada vraćam praznu listu
    res.json([]);
  } catch (error) {
    res.status(500).json({ message: "Greška pri dohvaćanju bilješki" });
  }
};