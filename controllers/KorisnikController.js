import Korisnik from "../models/Korisnik.js";

export const dohvatiKorisnika = async (req, res) => {
  try {
    const korisnik = await Korisnik.findById(req.user.id).select("-lozinka");
    if (!korisnik) return res.status(404).json({ message: "Korisnik nije pronađen" });
    res.json(korisnik);
  } catch (error) {
    res.status(500).json({ message: "Greška pri dohvaćanju korisnika" });
  }
};

export const postaviIme = async (req, res) => {
  try {
    const { ime } = req.body;
    const korisnik = await Korisnik.findByIdAndUpdate(
      req.user.id,
      { ime },
      { new: true }
    ).select("-lozinka");
    if (!korisnik) return res.status(404).json({ message: "Korisnik nije pronađen" });
    res.json(korisnik);
  } catch (error) {
    res.status(500).json({ message: "Greška pri postavljanju imena" });
  }
};

export const dohvatiPostavke = async (req, res) => {
  try {
    const korisnik = await Korisnik.findById(req.user.id).select("postavke");
    if (!korisnik) return res.status(404).json({ message: "Korisnik nije pronađen" });
    
    // Mapiraj model polja na frontend polja
    const postavke = {
      email: korisnik.postavke?.podsjetnici ?? true,
      zvuk: korisnik.postavke?.zvuk ?? true,
      push: korisnik.postavke?.push ?? true
    };
    
    res.json(postavke);
  } catch (error) {
    console.error("Greška pri dohvaćanju postavki:", error);
    res.status(500).json({ message: "Greška pri dohvaćanju postavki" });
  }
};

export const azurirajPostavke = async (req, res) => {
  try {
    const { email, zvuk, push } = req.body;
    
    // Mapiraj frontend polja na model polja
    const postavke = {
      notifikacije: email, 
      podsjetnici: email   
    };

    const korisnik = await Korisnik.findByIdAndUpdate(
      req.user.id,
      { postavke },
      { new: true }
    ).select("postavke");
    
    if (!korisnik) return res.status(404).json({ message: "Korisnik nije pronađen" });
    
    console.log(`Postavke ažurirane za korisnika ${req.user.id}: podsjetnici=${email}`);
    
    res.json(korisnik.postavke);
  } catch (error) {
    console.error("❌ Greška pri ažuriranju postavki:", error);
    res.status(500).json({ message: "Greška pri ažuriranju postavki" });
  }
};