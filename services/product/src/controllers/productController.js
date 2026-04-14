const { Op } = require('sequelize');
const Product = require('../models/Product');
const Category = require('../models/Category');
const Discount = require('../models/Discount');
const sequelize = require('../config/database');

// ==================== PRODUCTS ====================

// Map DB fields → Frontend fields
const mapProduct = (p) => {
  const json = p.toJSON ? p.toJSON() : p;
  return {
    ...json,
    title: json.name,
    year: json.release_year,
  };
};

exports.list = async (req, res) => {
  try {
    const { category, search } = req.query;
    const where = {};

    if (category) {
      const cat = await Category.findOne({ where: { name: { [Op.like]: `%${category}%` } } });
      if (cat) where.category_id = cat.id;
    }
    if (search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { artist: { [Op.like]: `%${search}%` } },
        { genre: { [Op.like]: `%${search}%` } },
      ];
    }

    const products = await Product.findAll({
      where,
      include: [{ model: Category, as: 'category', attributes: ['id', 'name'] }],
      order: [['created_at', 'DESC']],
    });

    res.json({ success: true, data: products.map(mapProduct) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.detail = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id, {
      include: [{ model: Category, as: 'category', attributes: ['id', 'name'] }],
    });
    if (!product) return res.json({ success: false, message: 'Không tìm thấy sản phẩm' });
    res.json({ success: true, data: mapProduct(product) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getByIds = async (req, res) => {
  try {
    const ids = (req.query.ids || '').split(',').map(Number).filter(Boolean);
    if (!ids.length) return res.json({ success: true, data: [] });

    const products = await Product.findAll({ where: { id: ids } });
    res.json({ success: true, data: products.map(mapProduct) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const { title, artist, genre, price, stock, description, image, year, status } = req.body;

    let categoryId = 1;
    if (genre) {
      const cat = await Category.findOne({ where: { name: { [Op.like]: `%${genre}%` } } });
      if (cat) categoryId = cat.id;
    }

    const product = await Product.create({
      name: title, artist, genre, price, stock,
      description, image: image || 'https://images.unsplash.com/photo-1603048588665-791ca8aea617?w=800&q=80',
      release_year: year || 2024, status: status || 'conhang', category_id: categoryId,
    });

    res.json({ success: true, message: 'Thêm sản phẩm thành công', id: product.id });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) return res.json({ success: false, message: 'Không tìm thấy sản phẩm' });

    const { title, artist, genre, price, stock, description, image, year, status } = req.body;

    let categoryId = product.category_id;
    if (genre) {
      const cat = await Category.findOne({ where: { name: { [Op.like]: `%${genre}%` } } });
      if (cat) categoryId = cat.id;
    }

    await product.update({
      name: title || product.name, artist, genre, price, stock,
      description, image, release_year: year, status, category_id: categoryId,
    });

    res.json({ success: true, message: 'Đã cập nhật sản phẩm' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const deleted = await Product.destroy({ where: { id: req.params.id } });
    if (deleted) res.json({ success: true, message: 'Đã xóa sản phẩm' });
    else res.json({ success: false, message: 'Không tìm thấy sản phẩm' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Internal: decrease stock (called by Order Service)
exports.decreaseStock = async (req, res) => {
  try {
    const { product_id, quantity } = req.body;
    const product = await Product.findByPk(product_id);
    if (!product) return res.json({ success: false, message: 'SP không tồn tại' });

    if (product.stock < quantity) {
      return res.json({ success: false, message: `Không đủ hàng. Còn ${product.stock} sản phẩm.` });
    }

    product.stock -= quantity;
    if (product.stock === 0) product.status = 'hethang';
    else if (product.stock <= 5) product.status = 'saphethang';
    await product.save();

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Internal: increase stock (called by Order Service on cancel, or Admin import)
exports.increaseStock = async (req, res) => {
  try {
    const { product_id, quantity } = req.body;
    const product = await Product.findByPk(product_id);
    if (!product) return res.json({ success: false, message: 'SP không tồn tại' });

    product.stock += quantity;
    if (product.stock > 0) product.status = 'conhang';
    await product.save();

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ==================== CATEGORIES ====================

exports.getCategories = async (req, res) => {
  try {
    const categories = await Category.findAll();
    res.json({ success: true, data: categories });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ==================== DISCOUNTS ====================

exports.getAllDiscounts = async (req, res) => {
  try {
    const discounts = await Discount.findAll({ order: [['created_at', 'DESC']] });
    res.json({ success: true, data: discounts });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.createDiscount = async (req, res) => {
  try {
    const { Code, LoaiGiamGia, GiaTri, DonHangToiThieu, SoLuong, NgayHetHan } = req.body;
    if (!Code || GiaTri <= 0) return res.json({ success: false, message: 'Dữ liệu không hợp lệ' });

    await Discount.create({
      code: Code, type: LoaiGiamGia || 'percent', value: GiaTri,
      min_order: DonHangToiThieu || 0, quantity: SoLuong || 0, expires_at: NgayHetHan || null,
    });
    res.json({ success: true, message: 'Tạo mã thành công' });
  } catch (err) {
    res.json({ success: false, message: 'Lỗi: Code đã tồn tại' });
  }
};

exports.updateDiscount = async (req, res) => {
  try {
    const discount = await Discount.findByPk(req.params.id);
    if (!discount) return res.json({ success: false, message: 'Không tìm thấy' });

    const { Code, LoaiGiamGia, GiaTri, DonHangToiThieu, SoLuong, NgayHetHan } = req.body;
    await discount.update({
      code: Code, type: LoaiGiamGia, value: GiaTri,
      min_order: DonHangToiThieu, quantity: SoLuong, expires_at: NgayHetHan,
    });
    res.json({ success: true, message: 'Cập nhật thành công' });
  } catch (err) {
    res.json({ success: false, message: 'Lỗi cập nhật' });
  }
};

exports.deleteDiscount = async (req, res) => {
  try {
    await Discount.destroy({ where: { id: req.params.id } });
    res.json({ success: true, message: 'Xoá thành công' });
  } catch (err) {
    res.json({ success: false, message: 'Lỗi xoá' });
  }
};

exports.checkDiscountCode = async (req, res) => {
  try {
    const { code, cartTotal } = req.body;
    if (!code) return res.json({ success: false, message: 'Vui lòng nhập mã' });

    const discount = await Discount.findOne({ where: { code: code.toUpperCase() } });
    if (!discount) return res.json({ success: false, message: 'Mã giảm giá không tồn tại' });

    if (discount.expires_at && new Date(discount.expires_at) < new Date()) {
      return res.json({ success: false, message: 'Mã đã hết hạn' });
    }
    if (discount.used_count >= discount.quantity) {
      return res.json({ success: false, message: 'Mã đã hết lượt sử dụng' });
    }
    if (cartTotal < parseFloat(discount.min_order)) {
      return res.json({ success: false, message: `Đơn hàng chưa đạt giá trị tối thiểu ${discount.min_order}đ` });
    }

    let discountAmount = 0;
    if (discount.type === 'percent') {
      discountAmount = cartTotal * (parseFloat(discount.value) / 100);
    } else {
      discountAmount = parseFloat(discount.value);
    }
    if (discountAmount > cartTotal) discountAmount = cartTotal;

    res.json({
      success: true,
      data: { code: discount.code, discountAmount },
      message: 'Áp dụng thành công!',
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Internal: increment discount usage (called by Order Service)
exports.incrementUsage = async (req, res) => {
  try {
    const { code } = req.body;
    const discount = await Discount.findOne({ where: { code: code.toUpperCase() } });
    if (discount) {
      discount.used_count += 1;
      await discount.save();
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Internal: calculate discount amount (called by Order Service)
exports.calculateDiscount = async (req, res) => {
  try {
    const { code, cartTotal } = req.body;
    if (!code) return res.json({ success: true, data: { amount: 0 } });

    const discount = await Discount.findOne({ where: { code: code.toUpperCase() } });
    if (!discount) return res.json({ success: true, data: { amount: 0 } });

    if (discount.expires_at && new Date(discount.expires_at) < new Date()) {
      return res.json({ success: true, data: { amount: 0 } });
    }
    if (discount.used_count >= discount.quantity) {
      return res.json({ success: true, data: { amount: 0 } });
    }
    if (cartTotal < parseFloat(discount.min_order)) {
      return res.json({ success: true, data: { amount: 0 } });
    }

    let amount = 0;
    if (discount.type === 'percent') {
      amount = Math.min(cartTotal, cartTotal * (parseFloat(discount.value) / 100));
    } else {
      amount = Math.min(cartTotal, parseFloat(discount.value));
    }

    res.json({ success: true, data: { amount } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ==================== INVENTORY (Admin) ====================

exports.inventoryList = async (req, res) => {
  try {
    const products = await Product.findAll({
      include: [{ model: Category, as: 'category', attributes: ['name'] }],
      order: [['id', 'DESC']],
    });
    const data = products.map(p => ({
      id: p.id, name: p.name, price: p.price,
      stock: p.stock, genre: p.category ? p.category.name : '', status: p.status,
    }));
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.importStock = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { admin_id, items, note } = req.body;
    if (!admin_id || !items || !items.length) {
      return res.json({ success: false, message: 'Dữ liệu không hợp lệ' });
    }

    let total = 0;
    items.forEach(item => { total += item.qty * item.price; });

    const { QueryTypes } = require('sequelize');
    const [receipt] = await sequelize.query(
      'INSERT INTO import_receipts (employee_id, total, note) VALUES (?, ?, ?)',
      { replacements: [admin_id, total, note || ''], type: QueryTypes.INSERT, transaction: t }
    );

    for (const item of items) {
      await sequelize.query(
        'INSERT INTO import_details (receipt_id, product_id, quantity, import_price) VALUES (?, ?, ?, ?)',
        { replacements: [receipt, item.id, item.qty, item.price], type: QueryTypes.INSERT, transaction: t }
      );
      const product = await Product.findByPk(item.id, { transaction: t });
      if (product) {
        product.stock += item.qty;
        if (product.stock > 0) product.status = 'conhang';
        await product.save({ transaction: t });
      }
    }

    await t.commit();
    res.json({ success: true, message: 'Nhập kho thành công!', phieu_nhap_id: receipt });
  } catch (err) {
    await t.rollback();
    res.status(500).json({ success: false, message: 'Lỗi nhập kho: ' + err.message });
  }
};

// Stats for admin dashboard
exports.stats = async (req, res) => {
  try {
    const totalProducts = await Product.count();
    res.json({ success: true, data: { totalProducts } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
