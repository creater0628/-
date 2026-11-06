const path = require('path');
const knex = require('knex');

// ===== 数据库连接（SQLite：无需安装服务、无需账号密码，数据库就是一个文件）=====
// 数据库文件位置：项目根目录\data\competition.db，不存在时会自动创建
// 以后要换回 MySQL，只需把下面这段 connection 配置换成 host/user/password/database
const MyDB = knex({
    client: 'better-sqlite3',
    connection: {
        filename: path.join(__dirname, '..', '..', 'data', 'competition.db')
    },
    useNullAsDefault: true
});

// 连接自检：启动时立刻能看出数据库是否可用，不用等到调接口才报错
MyDB.raw('SELECT 1')
    .then(function () { console.log('数据库连接成功 (SQLite)'); })
    .catch(function (e) { console.error('数据库连接失败:', e.message); });

// 检查数据库中是否已经存在 resumes 表
MyDB.schema.hasTable('resumes')
    .then(function (exists) {
        if (exists === false) {
            // 如果 resumes 表不存在就创建它
            return MyDB.schema.createTable('resumes', function (table) {
                // 创建 resumes 表
                // 将 cv_id 设置为主键字段（SQLite 下会自动递增）
                table.increments('cv_id').primary();
                table.string('name');       // 将 name 设置为字符串类型的字段
                table.string('gender');     // 将 gender 设置为字符串类型的字段
                table.string('age');        // 将 age 设置为字符串类型的字段
                table.string('phone');      // 将 phone 设置为字符串类型的字段
                table.string('email');      // 将 email 设置为字符串类型的字段
                table.string('education');  // 将 education 设置为字符串类型的字段
                table.string('professional');// 将 professional 设置为字符串类型的字段
            });
        }
    })
    .catch(function (e) { console.error('resumes 建表失败:', e.message); });

// 检查数据库中是否已经存在 education 表
MyDB.schema.hasTable('education')
    .then(function (exists) {
        if (exists === false) {
            // 如果 education 表不存在就创建它
            return MyDB.schema.createTable('education', function (table) {
                // 创建 education 表
                table.increments('edu_id').primary();
                table.string('school');       // 将 school 设置为字符串类型的字段
                table.string('major');        // 将 major 设置为字符串类型的字段
                table.string('degree');       // 将 degree 设置为字符串类型的字段
                table.date('graduation');     // 将 graduation 设置为 date 类型的字段
            });
        }
    })
    .catch(function (e) { console.error('education 建表失败:', e.message); });

// 检查数据库中是否已经存在 professional 表
MyDB.schema.hasTable('professional')
    .then(function (exists) {
        if (exists === false) {
            // 如果 professional 表不存在就创建它
            return MyDB.schema.createTable('professional', function (table) {
                // 创建 professional 表
                table.increments('pro_id').primary();
                table.string('company');      // 将 company 设置为字符串类型的字段
                table.string('title');        // 将 title 设置为字符串类型的字段
                table.date('startingDate');   // 将 startingDate 设置为 date 类型的字段
                table.date('endingDate');       // 将 endingDate 设置为 date 类型的字段
            });
        }
    })
    .catch(function (e) { console.error('professional 建表失败:', e.message); });

const MysqlApi = {};

MysqlApi.insert = function (table, jsonData) {
    return MyDB(table).insert(jsonData);
}

MysqlApi.getAll = async function (table) {
    const data = await MyDB(table).select('*');
    return data;
}

MysqlApi.getById = async function (table, id) {
    let key = 'cv_id';
    if (table == 'education') {
        key = 'edu_id';
    } else if (table == 'professional') {
        key = 'pro_id';
    }
    const data = await MyDB(table).where(key, id).select('*');
    return data;
}

MysqlApi.getResumeByName = async function (name) {
    const data = await MyDB('resumes').where('name', '=', name).select('*');
    return data;
}

// 更新：原来这里用了未定义的 data，现改为由调用方传入 newData
MysqlApi.update = function (table, id, newData) {
    let key = 'cv_id';
    if (table == 'education') {
        key = 'edu_id';
    } else if (table == 'professional') {
        key = 'pro_id';
    }
    return MyDB(table).update(newData).where(key, '=', id);
};

MysqlApi.delete = function (table, id) {
    let key = 'cv_id';
    if (table == 'education') {
        key = 'edu_id';
    } else if (table == 'professional') {
        key = 'pro_id';
    }
    return MyDB(table).delete().where(key, '=', id);
};
// 检查数据库中是否已经存在 weapons 表（三角洲行动武器库）
MyDB.schema.hasTable('weapons')
    .then(function (exists) {
        if (exists === false) {
            return MyDB.schema.createTable('weapons', function (table) {
                table.increments('weapon_id').primary();
                table.string('name');               // 武器名（唯一业务标识）
                table.string('category');           // 分类：突击步枪/冲锋枪/狙击步枪/霰弹枪/手枪/轻机枪/精确射手步枪
                table.string('slug');               // 英文标识（部分武器有，可为空）
                table.integer('price');             // 游戏内价格
                table.string('base_damage');        // 基础伤害（霰弹枪为 "14x8" 这类字符串，故用 string）
                table.integer('optimal_range');     // 最佳射程
                table.integer('recoil_control');    // 后坐力控制
                table.integer('handling');          // 操控性
                table.integer('stability');         // 稳定性
                table.integer('hip_fire_accuracy'); // 腰际射击精度
                table.string('armor_damage');       // 护甲伤害（同上，可能为 "16x8"）
                table.string('fire_rate');          // 射速（AN94 为 "600-1800"，故用 string）
                table.integer('magazine_capacity'); // 弹匣容量
                table.string('firing_mode');        // 射击模式：单发/全自动/连发
                table.integer('bullet_velocity');   // 子弹初速（m/s，数值）
                table.integer('gunshot_sound_range');// 枪声传播范围（m，数值）
                table.float('reload_time');         // 换弹时间（秒）
                table.timestamp('created_at').defaultTo(MyDB.fn.now());
            });
        }
    })
    .catch(function (e) { console.error('weapons 建表失败:', e.message); });

// 暴露底层 MyDB，方便自定义复杂查询（如 join、分页）
MysqlApi.db = MyDB;


module.exports = MysqlApi;
