const Order = require('../models/Order');
const OrderItem = require('../models/OrderItem');
const sequelize = require('../config/database');
const axios = require('axios');

const PRODUCT_URL = process.env.PRODUCT_SERVICE_URL;
const PAYMENT_URL = process.env.PAYMENT_SERVICE_URL;
const NOTIFICATION_URL = process.env.NOTIFICATION_SERVICE_URL;
const USER_URL = process.env.USER_SERVICE_URL;

exports.create = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const {
      customer_id, items, total, address, nguoiNhan, sdtNhan,
      ghiChu, phuongThucThanhToan, discountCode,
    } = req.body;

    if (!customer_id || !items || !items.length) {
      return res.json({ success: false, message: 'Dữ liệu không hợp lệ' });
    }

    // Calculate discount via Product Service
    let discountAmount = 0;
    if (discountCode) {
      try {
        const discRes = await axios.post(`${PRODUCT_URL}/discounts/calculate`, {
          code: discountCode, cartTotal: total,
        });
        if (discRes.data.success) discountAmount = discRes.data.data.amount;
      } catch (e) { /* ignore discount errors */ }
    }

    const finalTotal = Math.max(0, total - discountAmount);

    // Create order
    const order = await Order.create({
      customer_id, total: finalTotal, address,
      recipient_name: nguoiNhan, recipient_phone: sdtNhan,
      note: ghiChu, payment_method: phuongThucThanhToan || 'cod',
      discount_code: discountCode, discount_amount: discountAmount,
    }, { transaction: t });

    // Add order items & decrease stock
    for (const item of items) {
      await OrderItem.create({
        order_id: order.id, product_id: item.id,
        quantity: item.qty, price: item.price,
      }, { transaction: t });

      // Decrease stock via Product Service
      try {
        await axios.post(`${PRODUCT_URL}/decrease-stock`, {
          product_id: item.id, quantity: item.qty,
        });
      } catch (e) {
        await t.rollback();
        return res.json({ success: false, message: `Không đủ hàng cho sản phẩm ID ${item.id}` });
      }
    }

    // Increment discount usage
    if (discountAmount > 0 && discountCode) {
      try {
        await axios.post(`${PRODUCT_URL}/discounts/increment-usage`, { code: discountCode });
      } catch (e) { /* ignore */ }
    }

    await t.commit();

    // Create payment record first
    try {
      await axios.post(`${PAYMENT_URL}/create-record`, {
        order_id: order.id, amount: finalTotal,
        method: phuongThucThanhToan || 'cod',
        status: 'chuathanhtoan',
      });
    } catch (e) { /* ignore */ }

    // Handle PayOS payment link creation
    let payosData = null;
    if (phuongThucThanhToan === 'payos') {
      try {
        const payRes = await axios.post(`${PAYMENT_URL}/create-link`, {
          order_id: order.id, amount: finalTotal,
          description: `GrooveRec DH${order.id}`,
        });
        if (payRes.data.success) payosData = payRes.data.data;
      } catch (e) { /* payment link creation failed, order still valid */ }
    }

    // Send order confirmation email
    try {
      const customerRes = await axios.get(`${USER_URL}/customers/${customer_id}`);
      if (customerRes.data.success && customerRes.data.data.email) {
        const orderItems = await OrderItem.findAll({ where: { order_id: order.id } });
        await axios.post(`${NOTIFICATION_URL}/send-order-confirmation`, {
          email: customerRes.data.data.email,
          orderId: order.id,
          total: finalTotal,
          items: orderItems,
          address, nguoiNhan, sdtNhan,
        });
      }
    } catch (e) { /* email failure doesn't affect order */ }

    const response = { success: true, message: 'Đặt hàng thành công!', order_id: order.id };
    if (payosData) {
      response.checkoutUrl = payosData.checkoutUrl;
      response.payos_data = payosData;
    }

    res.json(response);
  } catch (err) {
    try { await t.rollback(); } catch (e) {}
    res.status(500).json({ success: false, message: 'Lỗi đặt hàng: ' + err.message });
  }
};

exports.list = async (req, res) => {
  try {
    const { customer_id } = req.query;
    const where = customer_id ? { customer_id } : {};
    const orders = await Order.findAll({
      where,
      include: [{ model: OrderItem, as: 'items' }],
      order: [['created_at', 'DESC']],
    });
    res.json({ success: true, data: orders });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.detail = async (req, res) => {
  try {
    const order = await Order.findByPk(req.params.id, {
      include: [{ model: OrderItem, as: 'items' }],
    });
    if (!order) return res.json({ success: false, message: 'Không tìm thấy đơn hàng' });

    // Get payment info
    let paymentInfo = null;
    try {
      const payRes = await axios.get(`${PAYMENT_URL}/by-order/${order.id}`);
      if (payRes.data.success) paymentInfo = payRes.data.data;
    } catch (e) {}

    // Enrich items with product data
    let enrichedItems = order.items;
    try {
      const productIds = order.items.map(i => i.product_id);
      if (productIds.length) {
        const prodRes = await axios.get(`${PRODUCT_URL}/by-ids`, {
          params: { ids: productIds.join(',') },
        });
        if (prodRes.data.success) {
          const prodMap = {};
          prodRes.data.data.forEach(p => { prodMap[p.id] = p; });
          enrichedItems = order.items.map(i => ({
            ...i.toJSON(),
            product: prodMap[i.product_id] || null,
          }));
        }
      }
    } catch (e) {}

    res.json({
      success: true,
      data: {
        info: { ...order.toJSON(), payment: paymentInfo },
        items: enrichedItems,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateStatus = async (req, res) => {
  try {
    const { order_id, status, admin_id } = req.body;
    if (!order_id || !status) return res.json({ success: false, message: 'Dữ liệu không hợp lệ' });

    const order = await Order.findByPk(order_id);
    if (!order) return res.json({ success: false, message: 'Không tìm thấy đơn' });

    order.status = status;
    if (admin_id) order.processed_by = admin_id;
    await order.save();

    // Send status update email
    try {
      const custRes = await axios.get(`${USER_URL}/customers/${order.customer_id}`);
      if (custRes.data.success && custRes.data.data.email) {
        await axios.post(`${NOTIFICATION_URL}/send-status-update`, {
          email: custRes.data.data.email,
          orderId: order_id,
          status,
        });
      }
    } catch (e) {}

    res.json({ success: true, message: 'Cập nhật trạng thái thành công' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.cancelOrder = async (req, res) => {
  try {
    const { order_id, customer_id } = req.body;
    if (!order_id || !customer_id) return res.json({ success: false, message: 'Dữ liệu không hợp lệ' });

    const order = await Order.findOne({ where: { id: order_id, customer_id } });
    if (!order) return res.json({ success: false, message: 'Đơn hàng không tồn tại hoặc không thuộc về bạn' });

    if (['danggiaohang', 'hoanthanh', 'dahuy'].includes(order.status)) {
      return res.json({ success: false, message: 'Đơn hàng này không thể hủy.' });
    }

    order.status = 'dahuy';
    await order.save();

    // Restore stock
    const items = await OrderItem.findAll({ where: { order_id } });
    for (const item of items) {
      try {
        await axios.post(`${PRODUCT_URL}/increase-stock`, {
          product_id: item.product_id, quantity: item.quantity,
        });
      } catch (e) {}
    }

    // Send cancel email
    try {
      const custRes = await axios.get(`${USER_URL}/customers/${customer_id}`);
      if (custRes.data.success && custRes.data.data.email) {
        await axios.post(`${NOTIFICATION_URL}/send-status-update`, {
          email: custRes.data.data.email, orderId: order_id, status: 'dahuy',
        });
      }
    } catch (e) {}

    res.json({ success: true, message: 'Đã hủy đơn hàng thành công' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.checkStatus = async (req, res) => {
  try {
    const { order_id } = req.query;
    if (!order_id) return res.json({ success: false });

    // Check payment status from Payment Service
    try {
      const payRes = await axios.get(`${PAYMENT_URL}/check-status/${order_id}`);
      if (payRes.data.success) {
        const payStatus = payRes.data.data.status;
        if (payStatus === 'dathanhtoan') {
          // Update order status if payment confirmed
          const order = await Order.findByPk(order_id);
          if (order && order.status === 'choxacnhan') {
            order.status = 'daxacnhan';
            await order.save();
          }
        }
        return res.json({ success: true, status: payStatus });
      }
    } catch (e) {}

    res.json({ success: true, status: 'chuathanhtoan' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Admin dashboard stats (aggregator)
exports.dashboardStats = async (req, res) => {
  try {
    const { QueryTypes } = require('sequelize');

    const [revResult] = await sequelize.query(
      "SELECT COALESCE(SUM(total), 0) as todayRevenue FROM orders WHERE DATE(created_at) = CURDATE() AND status = 'hoanthanh'",
      { type: QueryTypes.SELECT }
    );

    const [ordResult] = await sequelize.query(
      "SELECT COUNT(id) as todayOrders FROM orders WHERE DATE(created_at) = CURDATE() AND status != 'dahuy'",
      { type: QueryTypes.SELECT }
    );

    // Get product count & customer count from other services
    let totalProducts = 0, totalCustomers = 0, topProducts = [];
    try {
      const prodRes = await axios.get(`${PRODUCT_URL}/stats`);
      if (prodRes.data.success) totalProducts = prodRes.data.data.totalProducts;
    } catch (e) {}
    try {
      const custRes = await axios.get(`${USER_URL}/customers`);
      if (custRes.data.success) totalCustomers = custRes.data.data.length;
    } catch (e) {}

    // Top products calculation
    const topItems = await sequelize.query(
      `SELECT product_id, SUM(quantity) as sales, SUM(quantity * price) as revenue
       FROM order_items oi JOIN orders o ON oi.order_id = o.id
       WHERE o.status = 'hoanthanh' GROUP BY product_id ORDER BY sales DESC LIMIT 5`,
      { type: QueryTypes.SELECT }
    );

    if (topItems.length) {
      try {
        const ids = topItems.map(i => i.product_id).join(',');
        const prodRes = await axios.get(`${PRODUCT_URL}/by-ids`, { params: { ids } });
        if (prodRes.data.success) {
          const prodMap = {};
          prodRes.data.data.forEach(p => { prodMap[p.id] = p; });
          topProducts = topItems.map(i => ({
            id: i.product_id,
            name: prodMap[i.product_id]?.name || 'N/A',
            artist: prodMap[i.product_id]?.artist || '',
            sales: parseInt(i.sales),
            revenue: parseFloat(i.revenue),
          }));
        }
      } catch (e) {}
    }

    res.json({
      success: true,
      data: {
        todayRevenue: parseFloat(revResult.todayRevenue),
        todayOrders: parseInt(ordResult.todayOrders),
        totalProducts,
        totalCustomers,
        topProducts,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.revenueReport = async (req, res) => {
  try {
    const { QueryTypes } = require('sequelize');
    const startDate = req.query.start || new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0];
    const endDate = req.query.end || new Date().toISOString().split('T')[0];

    const data = await sequelize.query(
      `SELECT DATE(created_at) as date, SUM(total) as revenue, COUNT(id) as orders
       FROM orders WHERE DATE(created_at) >= ? AND DATE(created_at) <= ? AND status = 'hoanthanh'
       GROUP BY DATE(created_at) ORDER BY DATE(created_at) ASC`,
      { replacements: [startDate, endDate], type: QueryTypes.SELECT }
    );

    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Internal: update order status from Payment Service
exports.updatePaymentStatus = async (req, res) => {
  try {
    const { order_id, status } = req.body;
    const order = await Order.findByPk(order_id);
    if (order && order.status === 'choxacnhan' && status === 'daxacnhan') {
      order.status = 'daxacnhan';
      await order.save();
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
