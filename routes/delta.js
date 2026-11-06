const express = require('express');
const router = express.Router();
const MysqlApi = require('./useMysql');
router.get('/weapons', async (req, res, next) => {
    try {
        const { category } = req.query;
        const rows = category
            ? await MysqlApi.db('weapons').where('category', category).select('*')
            : await MysqlApi.getAll('weapons');
        res.json(rows);
    } catch (e) { next(e); }
});
router.get('/weapons/:id', async (req, res, next) => {
    try {
        const rows = await MysqlApi.db('weapons').where('weapon_id', req.params.id).select('*');
        rows.length ? res.json(rows[0]) : res.status(404).json({ error: '武器不存在' });
    } catch (e) { next(e); }
});
router.get('/categories', async (req, res, next) => {
    try {
        const rows = await MysqlApi.db('weapons').select('category').count('* as count').groupBy('category').orderBy('count', 'desc');
        res.json(rows);
    } catch (e) { next(e); }
});

// GET /api/delta/stats —— 概览统计，前端顶部数字卡片用
router.get('/stats', async (req, res, next) => {
    try {
        const total = await MysqlApi.db('weapons').count('* as c');
        const cats = await MysqlApi.db('weapons').distinct('category').select('category');
        const top = await MysqlApi.db('weapons').whereNotNull('handling').orderBy('handling', 'desc').limit(3).select('name', 'category', 'handling');
        res.json({
            total_weapons: total[0].c,
            categories: cats.length,
            top_handling: top
        });
    } catch (e) { next(e); }
});

module.exports = router;