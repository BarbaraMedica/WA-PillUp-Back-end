import Terapija from "../models/Terapija.js";

export const createTerapija = async (req, res) => {
  try {
    const terapija = new Terapija({
      ...req.body,
      korisnik: req.user.id
    });

    await terapija.save();
    res.status(201).json(terapija);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getMojeTerapije = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const terapije = await Terapija.find({ korisnik: req.user.id })
      .populate("lijek")
      .skip(skip)
      .limit(limit);

    res.json(terapije);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const deleteTerapija = async (req, res) => {
  try {
    await Terapija.findByIdAndDelete(req.params.id);
    res.json({ message: "Terapija obrisana" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
