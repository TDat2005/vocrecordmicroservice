const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Op } = require('sequelize');
const Account = require('../models/Account');
const Otp = require('../models/Otp');
const ActivityLog = require('../models/ActivityLog');
const axios = require('axios');

const JWT_SECRET = process.env.JWT_SECRET || 'default_secret';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

// Helper: generate JWT
function generateToken(account) {
  return jwt.sign(
    { id: account.id, username: account.username, role: account.role },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

// Helper: generate 6-digit OTP
function generateOTP() {
  return String(Math.floor(Math.random() * 1000000)).padStart(6, '0');
}

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;
    const account = await Account.findOne({ where: { username } });

    if (!account || !(await bcrypt.compare(password, account.password))) {
      return res.json({ success: false, message: 'Sai tài khoản hoặc mật khẩu!' });
    }

    if (!account.is_active) {
      return res.json({ success: false, message: 'Tài khoản của bạn đã bị khoá. Vui lòng liên hệ Admin.' });
    }

    const token = generateToken(account);

    // Get customer profile from User Service
    let profile = null;
    try {
      const userRes = await axios.get(
        `${process.env.USER_SERVICE_URL}/customers/by-account/${account.id}`
      );
      if (userRes.data.success) profile = userRes.data.data;
    } catch (e) {
      // User service might be down, continue without profile
    }

    res.json({
      success: true,
      token,
      user: {
        id: account.id,
        customer_id: profile ? profile.id : null,
        username: account.username,
        name: profile ? profile.full_name : '',
        role: account.role,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Lỗi server: ' + err.message });
  }
};

exports.register = async (req, res) => {
  try {
    const { username, password, fullname, email } = req.body;

    if (!username || !password) {
      return res.json({ success: false, message: 'Thiếu username hoặc password' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const account = await Account.create({ username, password: hashedPassword });

    // Create customer profile in User Service
    try {
      await axios.post(`${process.env.USER_SERVICE_URL}/customers`, {
        full_name: fullname || username,
        email: email || username,
        account_id: account.id,
      });
    } catch (e) {
      // Rollback account if user creation fails
      await account.destroy();
      throw new Error('Lỗi tạo hồ sơ khách hàng');
    }

    res.json({ success: true, message: 'Đăng ký thành công!' });
  } catch (err) {
    if (err.name === 'SequelizeUniqueConstraintError') {
      return res.json({ success: false, message: 'User hoặc Email đã tồn tại.' });
    }
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.sendRegisterOTP = async (req, res) => {
  try {
    const email = (req.body.email || '').trim();

    if (!email || !email.includes('@')) {
      return res.json({ success: false, message: 'Email không hợp lệ.' });
    }

    // Check if email already registered
    const existing = await Account.findOne({ where: { username: email } });
    if (existing) {
      return res.json({ success: false, message: 'Email này đã được đăng ký. Vui lòng đăng nhập.' });
    }

    const code = generateOTP();
    await Otp.create({
      email,
      code,
      type: 'register',
      expires_at: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes
    });

    // Call Notification Service to send OTP email
    try {
      await axios.post(`${process.env.NOTIFICATION_SERVICE_URL}/send-otp`, {
        email,
        otp: code,
        type: 'register',
      });
    } catch (e) {
      return res.json({ success: false, message: 'Không thể gửi email. Vui lòng thử lại sau.' });
    }

    res.json({ success: true, message: 'Mã OTP đã được gửi đến email của bạn.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.verifyRegisterOTP = async (req, res) => {
  try {
    const email = (req.body.email || '').trim();
    const otpCode = (req.body.otp || '').trim();
    const { password, fullname, phone } = req.body;

    if (!email || !otpCode || !password) {
      return res.json({ success: false, message: 'Thiếu thông tin bắt buộc.' });
    }

    // Verify OTP
    const validOtp = await Otp.findOne({
      where: {
        email,
        code: otpCode,
        type: 'register',
        is_used: false,
        expires_at: { [Op.gt]: new Date() },
      },
    });

    if (!validOtp) {
      return res.json({ success: false, message: 'Mã OTP không đúng hoặc đã hết hạn.' });
    }

    // Mark OTP as used
    validOtp.is_used = true;
    await validOtp.save();

    // Create account
    const hashedPassword = await bcrypt.hash(password, 10);
    const account = await Account.create({ username: email, password: hashedPassword });

    // Create customer profile in User Service
    try {
      await axios.post(`${process.env.USER_SERVICE_URL}/customers`, {
        full_name: fullname || email,
        email,
        phone: phone || null,
        account_id: account.id,
      });
    } catch (e) {
      await account.destroy();
      throw new Error('Lỗi tạo hồ sơ khách hàng');
    }

    const token = generateToken(account);

    res.json({
      success: true,
      message: 'Đăng ký thành công! Chào mừng bạn đến với Groove Records.',
      token,
      user: {
        id: account.id,
        username: account.username,
        name: fullname || email,
        role: account.role,
      },
    });
  } catch (err) {
    if (err.name === 'SequelizeUniqueConstraintError') {
      return res.json({ success: false, message: 'Email đã tồn tại.' });
    }
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.sendForgotOTP = async (req, res) => {
  try {
    const email = (req.body.email || '').trim();

    if (!email || !email.includes('@')) {
      return res.json({ success: false, message: 'Email không hợp lệ.' });
    }

    const user = await Account.findOne({ where: { username: email } });
    if (!user) {
      // Don't reveal if email exists (security)
      return res.json({ success: true, message: 'Nếu email tồn tại trong hệ thống, mã OTP sẽ được gửi.' });
    }

    const code = generateOTP();
    await Otp.create({
      email,
      code,
      type: 'forgot_password',
      expires_at: new Date(Date.now() + 5 * 60 * 1000),
    });

    try {
      await axios.post(`${process.env.NOTIFICATION_SERVICE_URL}/send-otp`, {
        email,
        otp: code,
        type: 'forgot_password',
      });
    } catch (e) {
      // Silently fail for security
    }

    res.json({ success: true, message: 'Nếu email tồn tại trong hệ thống, mã OTP sẽ được gửi.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.verifyForgotOTP = async (req, res) => {
  try {
    const email = (req.body.email || '').trim();
    const otpCode = (req.body.otp || '').trim();

    if (!email || !otpCode) {
      return res.json({ success: false, message: 'Thiếu thông tin.' });
    }

    const validOtp = await Otp.findOne({
      where: {
        email,
        code: otpCode,
        type: 'forgot_password',
        is_used: false,
        expires_at: { [Op.gt]: new Date() },
      },
    });

    if (!validOtp) {
      return res.json({ success: false, message: 'Mã OTP không đúng hoặc đã hết hạn.' });
    }

    res.json({ success: true, message: 'Xác thực thành công. Bạn có thể đặt mật khẩu mới.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const email = (req.body.email || '').trim();
    const otpCode = (req.body.otp || '').trim();
    const newPassword = req.body.new_password || '';

    if (!email || !otpCode || !newPassword) {
      return res.json({ success: false, message: 'Thiếu thông tin.' });
    }

    if (newPassword.length < 6) {
      return res.json({ success: false, message: 'Mật khẩu phải có ít nhất 6 ký tự.' });
    }

    const validOtp = await Otp.findOne({
      where: {
        email,
        code: otpCode,
        type: 'forgot_password',
        is_used: false,
        expires_at: { [Op.gt]: new Date() },
      },
    });

    if (!validOtp) {
      return res.json({ success: false, message: 'Mã OTP không hợp lệ hoặc đã hết hạn.' });
    }

    const user = await Account.findOne({ where: { username: email } });
    if (!user) {
      return res.json({ success: false, message: 'Không tìm thấy tài khoản.' });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    validOtp.is_used = true;
    await validOtp.save();

    res.json({ success: true, message: 'Đổi mật khẩu thành công!' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Internal endpoint: verify JWT token (used by other services)
exports.verifyToken = async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ success: false, message: 'No token provided' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const account = await Account.findByPk(decoded.id, {
      attributes: ['id', 'username', 'role', 'is_active'],
    });

    if (!account || !account.is_active) {
      return res.status(401).json({ success: false, message: 'Invalid or deactivated account' });
    }

    res.json({ success: true, user: account });
  } catch (err) {
    res.status(401).json({ success: false, message: 'Invalid token' });
  }
};

// Update password (internal, used by User Service)
exports.updatePassword = async (req, res) => {
  try {
    const { account_id, new_password } = req.body;
    const account = await Account.findByPk(account_id);
    if (!account) {
      return res.json({ success: false, message: 'Không tìm thấy tài khoản' });
    }

    account.password = await bcrypt.hash(new_password, 10);
    await account.save();
    res.json({ success: true, message: 'Cập nhật mật khẩu thành công' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Create account (internal, used by User Service for employee creation)
exports.createAccount = async (req, res) => {
  try {
    const { username, password, role } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const account = await Account.create({ username, password: hashedPassword, role: role || 'nhanvien' });
    res.json({ success: true, data: { id: account.id } });
  } catch (err) {
    if (err.name === 'SequelizeUniqueConstraintError') {
      return res.json({ success: false, message: 'Tên đăng nhập đã tồn tại!' });
    }
    res.status(500).json({ success: false, message: err.message });
  }
};

// Toggle account status (internal)
exports.toggleStatus = async (req, res) => {
  try {
    const { account_id, status } = req.body;
    const account = await Account.findByPk(account_id);
    if (!account) {
      return res.json({ success: false, message: 'Không tìm thấy tài khoản' });
    }
    account.is_active = !!status;
    await account.save();
    res.json({ success: true, message: status ? 'Đã mở khóa tài khoản!' : 'Đã khóa tài khoản!' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Activity log
exports.getActivityLog = async (req, res) => {
  try {
    const logs = await ActivityLog.findAll({
      order: [['created_at', 'DESC']],
      limit: 50,
    });
    res.json({ success: true, data: logs });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.createActivityLog = async (req, res) => {
  try {
    const { account_id, action, content } = req.body;
    await ActivityLog.create({ account_id, action, content });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
