export default (uloga) => {
  return (req, res, next) => {
    if (req.user.uloga !== uloga) {
      return res.status(403).json({ msg: "Zabranjen pristup" });
    }
    next();
  };
};
