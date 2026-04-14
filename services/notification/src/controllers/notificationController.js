const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const FROM = `"${process.env.SMTP_FROM_NAME || 'Groove Records'}" <${process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER}>`;

const STATUS_MAP = {
  choxacnhan: 'Chờ xác nhận',
  daxacnhan: 'Đã xác nhận',
  dangchuanbihang: 'Đang chuẩn bị hàng',
  danggiaohang: 'Đang giao hàng',
  hoanthanh: 'Hoàn thành',
  dahuy: 'Đã hủy',
};

exports.sendOtp = async (req, res) => {
  try {
    const { email, otp, type } = req.body;
    const subject = type === 'register'
      ? '🎵 Groove Records - Mã xác thực đăng ký'
      : '🔐 Groove Records - Mã xác thực quên mật khẩu';

    const html = `
      <div style="font-family:Arial,sans-serif; max-width:500px; margin:0 auto; padding:30px; border:2px solid #000; border-radius:12px;">
        <h2 style="text-align:center; color:#f97316;">🎵 Groove Records</h2>
        <p>Xin chào,</p>
        <p>${type === 'register' ? 'Mã xác thực đăng ký tài khoản của bạn:' : 'Mã xác thực quên mật khẩu của bạn:'}</p>
        <div style="text-align:center; margin:20px 0;">
          <span style="font-size:32px; font-weight:bold; letter-spacing:8px; background:#f97316; color:white; padding:10px 20px; border-radius:8px;">${otp}</span>
        </div>
        <p style="color:#666; font-size:13px;">⏳ Mã có hiệu lực trong 5 phút. Không chia sẻ mã này với bất kỳ ai.</p>
      </div>
    `;

    await transporter.sendMail({ from: FROM, to: email, subject, html });
    res.json({ success: true, message: 'Email sent' });
  } catch (err) {
    console.error('Email error:', err.message);
    res.status(500).json({ success: false, message: 'Không thể gửi email' });
  }
};

exports.sendOrderConfirmation = async (req, res) => {
  try {
    const { email, orderId, total, items, address, nguoiNhan, sdtNhan } = req.body;

    const itemRows = (items || []).map(i =>
      `<tr><td style="padding:8px; border-bottom:1px solid #eee;">SP #${i.product_id}</td><td style="padding:8px; border-bottom:1px solid #eee;">${i.quantity}</td><td style="padding:8px; border-bottom:1px solid #eee;">${Number(i.price).toLocaleString('vi-VN')}đ</td></tr>`
    ).join('');

    const html = `
      <div style="font-family:Arial,sans-serif; max-width:600px; margin:0 auto; padding:30px; border:2px solid #000; border-radius:12px;">
        <h2 style="text-align:center; color:#f97316;">🎵 Groove Records</h2>
        <h3>✅ Đơn hàng #${orderId} đã được tạo thành công!</h3>
        <table style="width:100%; border-collapse:collapse; margin:16px 0;">
          <tr style="background:#f97316; color:white;"><th style="padding:8px;">Sản phẩm</th><th style="padding:8px;">SL</th><th style="padding:8px;">Giá</th></tr>
          ${itemRows}
        </table>
        <p><strong>Tổng:</strong> ${Number(total).toLocaleString('vi-VN')}đ</p>
        <p><strong>Người nhận:</strong> ${nguoiNhan || 'N/A'}</p>
        <p><strong>Địa chỉ:</strong> ${address || 'N/A'}</p>
        <p style="color:#666; font-size:13px;">Cảm ơn bạn đã mua hàng tại Groove Records!</p>
      </div>
    `;

    await transporter.sendMail({
      from: FROM, to: email,
      subject: `🎵 Groove Records - Xác nhận đơn hàng #${orderId}`,
      html,
    });

    res.json({ success: true });
  } catch (err) {
    console.error('Order email error:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.sendStatusUpdate = async (req, res) => {
  try {
    const { email, orderId, status } = req.body;
    const statusText = STATUS_MAP[status] || status;

    const html = `
      <div style="font-family:Arial,sans-serif; max-width:500px; margin:0 auto; padding:30px; border:2px solid #000; border-radius:12px;">
        <h2 style="text-align:center; color:#f97316;">🎵 Groove Records</h2>
        <h3>📦 Cập nhật đơn hàng #${orderId}</h3>
        <p>Trạng thái mới: <strong style="color:#f97316;">${statusText}</strong></p>
        <p style="color:#666; font-size:13px;">Cảm ơn bạn đã mua hàng tại Groove Records!</p>
      </div>
    `;

    await transporter.sendMail({
      from: FROM, to: email,
      subject: `📦 Đơn hàng #${orderId} - ${statusText}`,
      html,
    });

    res.json({ success: true });
  } catch (err) {
    console.error('Status email error:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};
