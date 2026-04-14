const Post = require('../models/Post');
const axios = require('axios');

exports.list = async (req, res) => {
  try {
    const { type, status, limit } = req.query;
    const where = {};
    if (type) where.type = type;
    where.status = status || 'published';

    const posts = await Post.findAll({
      where,
      order: [['created_at', 'DESC']],
      limit: parseInt(limit) || 50,
    });
    res.json({ success: true, data: posts });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.detail = async (req, res) => {
  try {
    const post = await Post.findByPk(req.params.id);
    if (!post) return res.json({ success: false, message: 'Không tìm thấy bài viết' });
    res.json({ success: true, data: post });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const { title, content, type, image, status, account_id } = req.body;
    if (!title || !content) return res.json({ success: false, message: 'Dữ liệu không hợp lệ' });

    const post = await Post.create({
      title, content, type: type || 'blog',
      image, status: status || 'draft', account_id,
    });

    // Log activity
    if (account_id) {
      try {
        await axios.post(`${process.env.AUTH_SERVICE_URL}/activity-log`, {
          account_id, action: 'ThemBaiViet', content: `Thêm bài viết mới: '${title}'`,
        });
      } catch (e) {}
    }

    res.json({ success: true, message: 'Thêm bài viết thành công!', id: post.id });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const post = await Post.findByPk(req.params.id);
    if (!post) return res.json({ success: false, message: 'Không tìm thấy' });

    const { title, content, type, image, status, account_id } = req.body;
    await post.update({ title, content, type, image, status });

    if (account_id) {
      try {
        await axios.post(`${process.env.AUTH_SERVICE_URL}/activity-log`, {
          account_id, action: 'SuaBaiViet', content: `Sửa bài viết ID: ${post.id}`,
        });
      } catch (e) {}
    }

    res.json({ success: true, message: 'Cập nhật bài viết thành công!' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const deleted = await Post.destroy({ where: { id: req.params.id } });
    if (deleted) res.json({ success: true, message: 'Đã xóa bài viết' });
    else res.json({ success: false, message: 'Không tìm thấy' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
