var express = require('express');
var router = express.Router();
router.post('/newuser',function(req,res,next){
  res.send('用户注册');
})
router.post('/session',function(req,res,next){
  res.send('用户登录');
})
router.get('/:id',function(req,res,next){
  res.send(`查看用户${req.params.id}的信息`);
})
router.put('/:id',function(req,res,next){
  res.send(`更新用户${req.params.id}的信息`);
})
router.delete(`/:id`,function(req,res,next){
  res.send(`删除用户${req.params.id}的信息`);
})

module.exports = router;
