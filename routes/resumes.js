const express=require('express');
const router=express.Router();

router.post('newresume',function(req,res,next){
    res.send('添加新的简历');
})
router.get('/user/:id',function(req,res,next){
    res.send(`获取用户${req.params.id}简历的PDF版本`);
})
router.get('/:id',function(req,res,next){

    res.send(`查看用户${req.params.id}简历的PDF版本 `);
})
router.put('/:id',function(req,res,next){
    res.send(`更新用户${req.params.id}简历的PDF版本`);
})
router.delete('/:id',function(req,res,next){
    res.send(`删除用户${req.params.id}简历的PDF版本`);
})
router.delete('/:id',function(req,res,next){
    res.send(`删除用户${req.params.id}的简历`);

})
module.exports=router;