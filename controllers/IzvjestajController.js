import Lijek from "../models/Lijek.js";
import Terapija from "../models/Terapija.js";
import Korisnik from "../models/Korisnik.js";
import Biljeska from "../models/Biljeska.js";
import UzimanjeLijeka from "../models/UzimanjeLijeka.js";
import Tegoba from "../models/Tegoba.js";
import PDFDocument from "pdfkit";

export const generirajPDF = async (req, res) => {
  try {
    const korisnikId = req.user.id;

    // Dohvati sve podatke iz baze
    const korisnik = await Korisnik.findById(korisnikId).select("ime email");
    const lijekovi = await Lijek.find({ korisnik: korisnikId });
    const uzimanja = await UzimanjeLijeka.find({ korisnik: korisnikId })
      .populate("lijek", "ime doza nacin preostalo")
      .sort({ datum: -1 })
      .limit(30);
    const biljeske = await Biljeska.find({ korisnik: korisnikId })
      .populate("lijek_id", "ime doza")
      .sort({ createdAt: -1 })
      .limit(20);
    const tegobe = await Tegoba.find({ korisnik: korisnikId })
      .sort({ datum: -1 })
      .limit(20);

    // Kreiraj PDF
    const doc = new PDFDocument({ margin: 50 });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=PillUp_izvjestaj_${new Date().toISOString().slice(0, 10)}.pdf`
    );
    doc.pipe(res);

    // --- Naslov ---
    doc.fontSize(22).fillColor("#0e7490").text("PillUp - Izvještaj za liječnika", { align: "center" });
    doc.moveDown(0.5);
    doc.fontSize(11).fillColor("#64748b").text(`Datum: ${new Date().toLocaleDateString("hr-HR")}`, { align: "center" });
    doc.moveDown(1);

    // --- Korisnik ---
    doc.fontSize(14).fillColor("#1e293b").text("Korisnik");
    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke("#e2e8f0");
    doc.moveDown(0.3);
    doc.fontSize(11).fillColor("#334155")
      .text(`Ime: ${korisnik?.ime || "—"}`)
      .text(`Email: ${korisnik?.email || "—"}`);
    doc.moveDown(1);

    // --- Lijekovi ---
    doc.fontSize(14).fillColor("#1e293b").text("Trenutni lijekovi / suplementi");
    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke("#e2e8f0");
    doc.moveDown(0.3);
    if (!lijekovi.length) {
      doc.fontSize(11).fillColor("#64748b").text("Nema unesenih lijekova.");
    } else {
      lijekovi.forEach((l, i) => {
        doc.fontSize(11).fillColor("#1e293b")
          .text(`${i + 1}. ${l.ime} - Doza: ${l.doza || "—"}, Način: ${l.nacin || "—"}, Preostalo: ${l.preostalo ?? "—"}`);
      });
    }
    doc.moveDown(1);

    // --- Uzimanja (zadnjih 30) ---
    doc.fontSize(14).fillColor("#1e293b").text("Povijest uzimanja (zadnjih 30 zapisa)");
    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke("#e2e8f0");
    doc.moveDown(0.3);
    if (!uzimanja.length) {
      doc.fontSize(11).fillColor("#64748b").text("Nema zapisa o uzimanju.");
    } else {
      uzimanja.forEach(u => {
        const datum = new Date(u.datum).toLocaleDateString("hr-HR");
        const status = u.status === "uzet" ? "✓ Uzeto" : "✗ Preskočeno";
        doc.fontSize(11).fillColor(u.status === "uzet" ? "#166534" : "#991b1b")
          .text(`${datum} ${u.vrijeme || "—"} — ${u.lijek?.ime || "?"} — ${status}`);
      });
    }
    doc.moveDown(1);

    // --- Bilješke ---
    if (biljeske.length) {
      doc.fontSize(14).fillColor("#1e293b").text("Bilješke / nuspojave");
      doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke("#e2e8f0");
      doc.moveDown(0.3);
      biljeske.forEach(b => {
        const lijekInfo = b.lijek_id ? `${b.lijek_id.ime} — Doza: ${b.lijek_id.doza || "—"}` : "Nije vezano uz lijek";
        doc.fontSize(11).fillColor("#334155")
          .text(`[${b.vrsta}] ${b.tekst} (${lijekInfo})`);
      });
      doc.moveDown(1);
    }

    // --- Tegobe ---
    if (tegobe.length) {
      doc.fontSize(14).fillColor("#1e293b").text("Tegobe / nuspojave");
      doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke("#e2e8f0");
      doc.moveDown(0.3);
      tegobe.forEach(t => {
        const datum = new Date(t.datum).toLocaleDateString("hr-HR");
        doc.fontSize(11).fillColor("#334155").text(`${datum} — ${t.tegoba}`);
      });
      doc.moveDown(1);
    }

    // --- Footer ---
    doc.fontSize(9).fillColor("#94a3b8").text("Generirao PillUp - osobni zdravstveni asistent", { align: "center" });

    doc.end();
  } catch (error) {
    console.error("PDF greška:", error);
    res.status(500).json({ message: "Greška pri generiranju PDF-a" });
  }
};

// DOHVATI UZETE LIJEKOVE
export const dohvatiUzeteLijekove = async (req, res) => {
  try {
    const uzimanja = await UzimanjeLijeka.find({ korisnik: req.user.id })
      .populate("lijek", "ime doza nacin preostalo")
      .sort({ datum: -1 })
      .limit(30);

    res.json(uzimanja);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Greška pri dohvaćanju uzetih lijekova" });
  }
};

// DOHVATI BILJEŠKE
export const dohvatiBiljeske = async (req, res) => {
  try {
    const biljeske = await Biljeska.find({ korisnik: req.user.id })
      .populate("lijek_id", "ime doza")
      .sort({ createdAt: -1 });

    res.json(biljeske);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Greška pri dohvaćanju bilješki" });
  }
};