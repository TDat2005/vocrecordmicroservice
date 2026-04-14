const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/contentController');

router.get('/posts', ctrl.list);
router.get('/posts/:id', ctrl.detail);
router.post('/posts', ctrl.create);
router.put('/posts/:id', ctrl.update);
router.delete('/posts/:id', ctrl.remove);

module.exports = router;
