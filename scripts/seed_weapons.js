// ===== 武器数据灌库脚本 =====
// 用法：npm run seed
// 数据来源：data/weapons_data.json（由 scripts/seed_weapons.js.bak 中你手工收集的 70 条原始数据规范化而来）
// 重灌方法：先删除 data/competition.db，启动一次服务重建空表，再跑 npm run seed
const MysqlApi = require('../routes/useMysql');
const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, '..', 'data', 'weapons_data.json');
const TABLE = 'weapons';

// 建表是异步的，等待表结构就绪后再写入，避免"表不存在"报错
async function waitForTable(tries = 20) {
    for (let i = 0; i < tries; i++) {
        if (await MysqlApi.db.schema.hasTable(TABLE)) return true;
        await new Promise(r => setTimeout(r, 200));
    }
    return false;
}

// 插入前逐条校验，避免一条脏数据导致整批失败
function validate(w, i) {
    const errors = [];
    if (!w.name) errors.push('缺少 name');
    if (!w.category) errors.push('缺少 category');
    for (const f of ['optimal_range', 'handling', 'stability', 'hip_fire_accuracy', 'magazine_capacity']) {
        if (w[f] === null || w[f] === undefined) errors.push(`缺少 ${f}`);
    }
    if (errors.length) console.warn(` 第 ${i + 1} 条 [${w.name || '无名'}]: ${errors.join('、')}`);
    return errors.length === 0;
}

(async () => {
    try {
        if (!fs.existsSync(DATA_FILE)) {
            console.error('找不到数据文件:', DATA_FILE);
            process.exit(1);
        }
        const weapons = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
        console.log(`读取到 ${weapons.length} 条武器数据`);

        if (!(await waitForTable())) {
            console.error('weapons 表未就绪，请先启动一次服务（npm run dev）以完成建表');
            process.exit(1);
        }

        const exist = await MysqlApi.getAll(TABLE);
        if (exist.length > 0) {
            console.log(`表中已有 ${exist.length} 条数据，跳过写入。要重灌请先删除 data\\competition.db`);
            process.exit(0);
        }

        let ok = 0, bad = 0;
        for (let i = 0; i < weapons.length; i++) {
            const w = weapons[i];
            // 不强制拦截：字段缺失也照样入库，缺失值为 null，前端显示"—"
            if (!validate(w, i)) bad++;
            await MysqlApi.insert(TABLE, w);
            ok++;
        }

        console.log(`\n已写入 ${ok} 条武器数据${bad ? `（其中 ${bad} 条有字段缺失，值为 null）` : ''}`);

        // 写入结果核对
        const rows = await MysqlApi.db(TABLE).count('* as c');
        console.log('表中实际行数:', rows[0].c);
        const cats = await MysqlApi.db(TABLE).select('category').count('* as c').groupBy('category');
        console.log('分类统计:');
        cats.forEach(c => console.log(`  ${c.category}: ${c.c} 把`));
        process.exit(0);
    } catch (e) {
        console.error('数据失败:', e.message);
        process.exit(1);
    }
})();
