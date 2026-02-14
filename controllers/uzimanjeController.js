import UzimanjeLijeka from "../modeli/UzimanjeLijeka.js";

export const potvrdiUzimanje = async (req, res) => {
  try {
    const { terapijaId, vrijeme } = req.body;

    const zapis = await UzimanjeLijeka.create({
      korisnik: req.user.id,
      terapija: terapijaId,
      datum: new Date(),
      vrijeme,
      status: "uzet"
    });

    res.status(201).json(zapis);
  } catch (error) {
    res.status(500).json({ message: "Greška pri spremanju uzimanja" });
  }
};
