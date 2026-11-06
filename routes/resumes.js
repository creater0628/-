
const express = require('express');
const router = express.Router();
const MysqlApi = require('./useMysql');
const TABLE = 'resumes';
async function nextId() {
    const all = await MysqlApi.getAll(TABLE);
    return all.reduce((max, r) => Math.max(max, Number(r.cv_id) || 0), 0) + 1;
}
router.get('/', async function (req, res, next) {
    try {
        res.json(await MysqlApi.getAll(TABLE));
    } catch (e) { next(e); }
});
router.get('/search', async function (req, res, next) {
    try {
        res.json(await MysqlApi.getResumeByName(req.query.name));
    } catch (e) { next(e); }
});
router.get('/:id', async function (req, res, next) {
    try {
        const rows = await MysqlApi.getById(TABLE, req.params.id);
        if (!rows || rows.length === 0) return res.status(404).json({ error: '简历不存在' });
        res.json(rows[0]);
    } catch (e) { next(e); }
});
router.post('/', async function (req, res, next) {
    try {
        const body = req.body || {};
        if (!body.name) return res.status(400).json({ error: '缺少必填字段 name' });
        const row = {
            cv_id: body.cv_id || await nextId(),
            name: body.name,
            gender: body.gender || '',
            age: body.age || '',
            phone: body.phone || '',
            email: body.email || '',
            education: body.education || '',
            professional: body.professional || ''
        };
        await MysqlApi.insert(TABLE, row);
        res.status(201).json(row);
    } catch (e) { next(e); }
});
router.put('/:id', async function (req, res, next) {
    try {
        const rows = await MysqlApi.getById(TABLE, req.params.id);
        if (!rows || rows.length === 0) return res.status(404).json({ error: '简历不存在' });
        const newData = { ...rows[0], ...req.body, cv_id: Number(req.params.id) };
        await MysqlApi.update(TABLE, req.params.id, newData);
        res.json(newData);
    } catch (e) { next(e); }
});
router.delete('/:id', async function (req, res, next) {
    try {
        const rows = await MysqlApi.getById(TABLE, req.params.id);
        if (!rows || rows.length === 0) return res.status(404).json({ error: '简历不存在' });
        await MysqlApi.delete(TABLE, req.params.id);
        res.json({ ok: true, deleted: req.params.id });
    } catch (e) { next(e); }
});

module.exports = router;