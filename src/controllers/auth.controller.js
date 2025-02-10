const authService = require("../services/auth.service");

const register = async (req, res) => {
  try {
    const response = await authService.register(
      req.body.fullName,
      req.body.email,
      req.body.password
    );

    res.status(200).json(response);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const verifyOTP = async (req, res) => {
  try {
    const response = await authService.verifyOTP(req.body.email, req.body.otp);
    res.status(200).json(response);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const login = async (req, res) => {
  try {
    const response = await authService.login(req.body.email, req.body.password);
    res.status(200).json(response);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const refreshToken = async (req, res) => {
  try {
    const response = await authService.refreshToken(req.body.refreshToken);
    res.status(200).json(response);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const logout = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    const result = await authService.logout(refreshToken);
    res.status(200).json(result);
  } catch (error) {
    res.status(error.statusCode || 500).json({ message: error.message });
  }
};

module.exports = { register, verifyOTP, login, refreshToken, logout };
