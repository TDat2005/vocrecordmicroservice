const crypto = require('crypto');
const axios = require('axios');
const Payment = require('../models/Payment');

const PAYOS_CLIENT_ID = process.env.PAYOS_CLIENT_ID;
const PAYOS_API_KEY = process.env.PAYOS_API_KEY;
const PAYOS_CHECKSUM_KEY = process.env.PAYOS_CHECKSUM_KEY;
const PAYOS_RETURN_URL = process.env.PAYOS_RETURN_URL;
const PAYOS_CANCEL_URL = process.env.PAYOS_CANCEL_URL;
const ORDER_URL = process.env.ORDER_SERVICE_URL;

exports.createPaymentLink = async (req, res) => {
  try {
    const { order_id, amount, description } = req.body;
    const orderCode = parseInt(String(Date.now()) + String(order_id).slice(-4));

    const data = {
      orderCode,
      amount: Math.round(amount),
      description: (description || `DH${order_id}`).substring(0, 25),
      returnUrl: `${PAYOS_RETURN_URL}?order_id=${order_id}`,
      cancelUrl: `${PAYOS_CANCEL_URL}?order_id=${order_id}`,
    };

    // Create signature
    const signatureString = `amount=${data.amount}&cancelUrl=${data.cancelUrl}&description=${data.description}&orderCode=${data.orderCode}&returnUrl=${data.returnUrl}`;
    data.signature = crypto.createHmac('sha256', PAYOS_CHECKSUM_KEY).update(signatureString).digest('hex');

    const response = await axios.post('https://api-merchant.payos.vn/v2/payment-requests', data, {
      headers: {
        'Content-Type': 'application/json',
        'x-client-id': PAYOS_CLIENT_ID,
        'x-api-key': PAYOS_API_KEY,
      },
    });

    if (response.data.code === '00') {
      // Save transaction code
      await Payment.update(
        { transaction_code: String(orderCode), status: 'dangxuly' },
        { where: { order_id } }
      );

      return res.json({ success: true, data: response.data.data });
    }

    res.json({ success: false, message: response.data.desc || 'PayOS error' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Lỗi tạo Payment Link: ' + err.message });
  }
};

exports.createRecord = async (req, res) => {
  try {
    const { order_id, amount, method, status, transaction_code } = req.body;
    await Payment.create({ order_id, amount, method, status, transaction_code });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.webhook = async (req, res) => {
  try {
    const webhookData = req.body.data;
    const signature = req.body.signature;

    // Verify signature
    const verifyString = `amount=${webhookData.amount}&cancel=${webhookData.cancel ? 'true' : 'false'}&description=${webhookData.description}&orderCode=${webhookData.orderCode}&status=${webhookData.status}`;
    const computed = crypto.createHmac('sha256', PAYOS_CHECKSUM_KEY).update(verifyString).digest('hex');

    if (computed !== signature) {
      return res.status(400).json({ success: false, message: 'Invalid signature' });
    }

    const payment = await Payment.findOne({
      where: { transaction_code: String(webhookData.orderCode) },
    });

    if (payment) {
      if (webhookData.status === 'PAID') {
        payment.status = 'dathanhtoan';
        payment.paid_at = new Date();
        await payment.save();

        // Notify Order Service
        try {
          await axios.post(`${ORDER_URL}/payment-status`, {
            order_id: payment.order_id, status: 'daxacnhan',
          });
        } catch (e) {}
      } else if (['CANCELLED', 'EXPIRED'].includes(webhookData.status)) {
        payment.status = 'thatbai';
        await payment.save();
      }
    }

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getByOrder = async (req, res) => {
  try {
    const payment = await Payment.findOne({ where: { order_id: req.params.orderId } });
    if (!payment) return res.json({ success: false, message: 'Không tìm thấy' });
    res.json({ success: true, data: payment });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.checkStatus = async (req, res) => {
  try {
    const payment = await Payment.findOne({ where: { order_id: req.params.orderId } });
    if (!payment) return res.json({ success: false });

    if (payment.status === 'dathanhtoan') {
      return res.json({ success: true, data: { status: 'dathanhtoan' } });
    }

    // If PayOS, actively check
    if (payment.method === 'payos' && payment.transaction_code) {
      try {
        const response = await axios.get(
          `https://api-merchant.payos.vn/v2/payment-requests/${payment.transaction_code}`,
          { headers: { 'Content-Type': 'application/json', 'x-client-id': PAYOS_CLIENT_ID, 'x-api-key': PAYOS_API_KEY } }
        );

        if (response.data.code === '00' && response.data.data.status === 'PAID') {
          payment.status = 'dathanhtoan';
          payment.paid_at = new Date();
          await payment.save();

          try {
            await axios.post(`${ORDER_URL}/payment-status`, {
              order_id: payment.order_id, status: 'daxacnhan',
            });
          } catch (e) {}

          return res.json({ success: true, data: { status: 'dathanhtoan' } });
        } else if (['CANCELLED', 'EXPIRED'].includes(response.data.data?.status)) {
          payment.status = 'thatbai';
          await payment.save();
          return res.json({ success: true, data: { status: 'thatbai' } });
        }
      } catch (e) {
        console.error("PayOS Check Status Error:", e.response?.data || e.message);
      }
    }

    res.json({ success: true, data: { status: payment.status } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
