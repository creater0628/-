const knex=require('knex');
const MyDB=knex({
    client:'mysql',
    connection:{
        host:'127.0.0.1',
        user:'your_username',
        password:'your_password',
        database:'your_database'
    }
})
// 检查数据库中是否已经存在 resumes 表
MyDB.schema.hasTable('resumes')
  .then(function(exists) {
    if (exists === false) {
      // 如果 resumes 表不存在就创建它
      return MyDB.schema.createTable('resumes', function(table) {
        // 创建 resumes 表
        // 将 cv_id 设置为类型为 bigint 的主键字段
        table.bigInteger('cv_id').primary();
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

// 检查数据库中是否已经存在 education 表
MyDB.schema.hasTable('education')
  .then(function(exists) {
    if (exists === false) {
      // 如果 education 表不存在就创建它
      return MyDB.schema.createTable('education', function(table) {
        // 创建 education 表
        // 将 edu_id 设置为类型为 bigint 的主键字段
        table.bigInteger('edu_id').primary();
        table.string('school');       // 将 school 设置为字符串类型的字段
        table.string('major');        // 将 major 设置为字符串类型的字段
        table.string('degree');       // 将 degree 设置为字符串类型的字段
        table.date('graduation');     // 将 graduation 设置为 date 类型的字段
      });
    }
  })

// 检查数据库中是否已经存在 professional 表
MyDB.schema.hasTable('professional')
  .then(function(exists) {
    if (exists === false) {
      // 如果 professional 表不存在就创建它
      return MyDB.schema.createTable('professional', function(table) {
        // 创建 professional 表
        // 将 pro_id 设置为类型为 bigint 的主键字段
        table.bigInteger('pro_id').primary();
        table.string('company');      // 将 company 设置为字符串类型的字段
        table.string('title');        // 将 title 设置为字符串类型的字段
        table.date('startingDate');   // 将 startingDate 设置为 date 类型的字段
        table.date('endingDate');     // 将 endingDate 设置为 date 类型的字段
      });
    }
  })
  const MysqlApi={};
  MysqlApi.insert=function(table,jsonData){
    return MyDB(table).insert(jsonData);
  }
  MysqlApi.getAll=async function(table){
    const data=await MyDB(table).select('*');
    console.log(data);
    return data;
  }
  MysqlApi.getById=async function(table,id){
    const key='cv_id';
    if(table=='education'){
        key='edu_id';
    }else if(table=='professional'){
        key='pro_id';
    }
    const data=await MyDB(table).where(key,id).select('*');
    console.log(data);
    return data;
  }
  MysqlApi.getResumeByName=async function(name){
    const data=await MyDB('resumes').where('name','=',name).select('*');
    console.log(data);
    return data;
  }
  MysqlApi.update=function(table,id){
    const key='cv_id';
    if(table=='education'){
        key='edu_id';
    }else if(table=='professional'){
        key='pro_id';
    }
    return MyDB(table).update(data).where(key,'=',id);
    
  };
  MysqlApi.delete=function(table,id){
    const key='cv_id';
    if(table=='education'){
        key='edu_id';
    }else if(table=='professional'){
        key='pro_id';
    }
    return MyDB(table).delete().where(key,'=',id);
  };
  module.exports=MysqlApi;