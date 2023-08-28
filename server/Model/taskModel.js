const  mongoose  = require('mongoose')

const TaskModel=new mongoose.Schema({
    title:{
        type:String,
        trim:true
    },
    description:{
        type:String,
        trim:true
    }
})
const taskDataModel=new mongoose.model("taskList",TaskModel)
module.exports=taskDataModel