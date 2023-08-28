const mongoose =require('mongoose')

const UserModel=new mongoose.Schema({
    username:{
        type:String,
        trim:true
    },
    email:{
        type:String,
        trim:true
    },
    password:{
        type:String,
        trim:true
    },
    confirmPassword:{
        type:String,
        trim:true
    }

})

const userModelData=new mongoose.model("todoList",UserModel)
module.exports=userModelData