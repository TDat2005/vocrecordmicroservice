const Customer = require('../models/Customer');
const Employee = require('../models/Employee');
const Wishlist = require('../models/Wishlist');
const axios = require('axios');

// ==================== CUSTOMER ====================

exports.getProfile = async (req, res) => {
  try {
    const customer = await Customer.findByPk(req.params.id);
    if (!customer) return res.json({ success: false, message: 'Không tìm thấy khách hàng' });
    res.json({
      success: true,
      data: {
        id: customer.id,
        fullName: customer.full_name,
        email: customer.email,
        phone: customer.phone,
        address: customer.address,
        account_id: customer.account_id,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getByAccountId = async (req, res) => {
  try {
    const customer = await Customer.findOne({ where: { account_id: req.params.accountId } });
    if (!customer) return res.json({ success: false, message: 'Không tìm thấy' });
    res.json({ success: true, data: customer });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.createCustomer = async (req, res) => {
  try {
    const { full_name, email, phone, account_id } = req.body;
    const customer = await Customer.create({ full_name, email, phone, account_id });
    res.json({ success: true, data: { id: customer.id } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { fullName, phone, address } = req.body;
    const customer = await Customer.findByPk(req.params.id);
    if (!customer) return res.json({ success: false, message: 'Không tìm thấy khách hàng' });

    if (fullName) customer.full_name = fullName;
    if (phone !== undefined) customer.phone = phone;
    if (address !== undefined) customer.address = address;
    await customer.save();

    res.json({ success: true, message: 'Cập nhật thông tin thành công' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getAllCustomers = async (req, res) => {
  try {
    const customers = await Customer.findAll({ order: [['created_at', 'DESC']] });
    res.json({ success: true, data: customers });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ==================== EMPLOYEE ====================

exports.getAllEmployees = async (req, res) => {
  try {
    const employees = await Employee.findAll({ order: [['created_at', 'DESC']] });
    res.json({ success: true, data: employees });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.createEmployee = async (req, res) => {
  try {
    const { name, position, username, password, role } = req.body;

    if (!username || !password || !name) {
      return res.json({ success: false, message: 'Vui lòng điền đủ thông tin bắt buộc' });
    }

    // Create account via Auth Service
    const authRes = await axios.post(`${process.env.AUTH_SERVICE_URL}/create-account`, {
      username, password, role: role || 'nhanvien',
    });

    if (!authRes.data.success) {
      return res.json({ success: false, message: authRes.data.message });
    }

    await Employee.create({
      full_name: name,
      position,
      account_id: authRes.data.data.id,
    });

    res.json({ success: true, message: 'Thêm nhân viên thành công!' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateEmployee = async (req, res) => {
  try {
    const { name, position, role, password } = req.body;
    const employee = await Employee.findByPk(req.params.id);
    if (!employee) return res.json({ success: false, message: 'Không tìm thấy nhân viên' });

    if (name) employee.full_name = name;
    if (position) employee.position = position;
    await employee.save();

    // Update auth role if provided
    if (role) {
      await axios.post(`${process.env.AUTH_SERVICE_URL}/toggle-status`, {
        account_id: employee.account_id, status: 1,
      });
    }

    // Update password if provided
    if (password) {
      await axios.post(`${process.env.AUTH_SERVICE_URL}/update-password`, {
        account_id: employee.account_id, new_password: password,
      });
    }

    res.json({ success: true, message: 'Cập nhật thành công!' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.toggleEmployeeStatus = async (req, res) => {
  try {
    const { account_id, status } = req.body;
    const authRes = await axios.post(`${process.env.AUTH_SERVICE_URL}/toggle-status`, {
      account_id, status,
    });
    res.json(authRes.data);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ==================== WISHLIST ====================

exports.getWishlist = async (req, res) => {
  try {
    const items = await Wishlist.findAll({
      where: { customer_id: req.params.customerId },
      order: [['created_at', 'DESC']],
    });

    // Enrich with product data from Product Service
    if (items.length > 0) {
      try {
        const productIds = items.map(i => i.product_id);
        const productRes = await axios.get(`${process.env.PRODUCT_SERVICE_URL}/by-ids`, {
          params: { ids: productIds.join(',') },
        });
        if (productRes.data.success) {
          const productMap = {};
          productRes.data.data.forEach(p => { productMap[p.id] = p; });
          const enriched = items.map(item => ({
            ...item.toJSON(),
            product: productMap[item.product_id] || null,
          }));
          return res.json({ success: true, data: enriched });
        }
      } catch (e) {
        // If product service is down, return without enrichment
      }
    }

    res.json({ success: true, data: items });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.addToWishlist = async (req, res) => {
  try {
    const { customer_id, product_id } = req.body;
    if (!customer_id || !product_id) {
      return res.json({ success: false, message: 'Dữ liệu không đầy đủ.' });
    }

    const exists = await Wishlist.findOne({ where: { customer_id, product_id } });
    if (exists) {
      return res.json({ success: false, message: 'Sản phẩm đã có trong danh sách!' });
    }

    const item = await Wishlist.create({ customer_id, product_id });
    res.json({ success: true, message: 'Đã thêm vào danh sách yêu thích', wishlist_id: item.id });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.removeFromWishlist = async (req, res) => {
  try {
    const { customer_id, product_id } = req.body;
    await Wishlist.destroy({ where: { customer_id, product_id } });
    res.json({ success: true, message: 'Đã xóa khỏi danh sách yêu thích' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
