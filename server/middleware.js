const jwt=require('jsonwebtoken')

const middleware=async(req,res,next)=>{
    try{
        const token=await req.header("n-token")
    if(!token){
        return res.status(400).send("token not found")
    }else{
        let decode=jwt.verify(token,"jwtSecret")
        req.user=decode.user
        next()
    }
   
    }catch(e){
        return res.status(404).send("Internal server error")
    }
}

module.exports=middleware