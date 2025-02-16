const authService = require("../services/auth.service");

//register using email
const registerByMail = async (req, res) => {
  try {
    const { fullName, email, password } = req.body;
    const response = await authService.register(fullName, email, password);
    res.status(200).json(response);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const response = await authService.verifyOTP(email, otp);
    res.status(200).json(response);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const response = await authService.login(email, password);
    res.status(200).json(response);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    const response = await authService.refreshToken(refreshToken);
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

const requestResetPassword = async (req, res) => {
  try {
    const { email, redirectUrl } = req.body; // Nhận URL từ FE
    await authService.requestResetPassword(email, redirectUrl);
    res.json({ message: "Vui lòng kiểm tra email để đặt lại mật khẩu" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const verifyResetToken = async (req, res) => {
  try {
    const { token } = req.query;
    await authService.verifyResetToken(token);
    res.json({ message: "Token hợp lệ, tiếp tục đặt lại mật khẩu" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    await authService.resetPassword(token, newPassword);
    res.json({ message: "Đặt lại mật khẩu thành công" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const loginWithGoogle = async (req, res) => {
  try {
    const { token } = req.body;
    if (!token)
      return res
        .status(400)
        .json({ message: "Token Google không được để trống" });

    const data = await authService.googleLogin(token);
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  registerByMail,
  verifyOTP,
  login,
  refreshToken,
  logout,
  requestResetPassword,
  verifyResetToken,
  resetPassword,
  loginWithGoogle,
};
