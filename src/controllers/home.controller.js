class HomeController {
  static async getHomePage(req, res) {
    try {
      res.status(200).json({
        message: "Welcome to the Art Toy Store!",
      });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
}

module.exports = HomeController;
