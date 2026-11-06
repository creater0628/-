const {MongoClient} = require('mongodb');
const serverUr1 = 'mongodb://localhost:27017';
const databaseName='online_resume';
const client=new MongoClient(serverUr1);
async function test(){
    try{
    await client.connect();
    const db = client.db(databaseName);
    console.log("数据库连接成功！");
    }catch(error){
    console.log("数据库连接失败！",error);
    }finally{
    await client.close();
    }

}
test();