const express = require('express')
const { mongoose } = require('mongoose')
const dotenv = require('dotenv')
const cors = require('cors')
const userModelData = require('./Model/userModel')
const jwt = require('jsonwebtoken')
const middleware = require('./middleware')
const bcrypt = require('bcrypt')
const taskDataModel = require('./Model/taskModel')

const app = express()
app.use(express.json())
dotenv.config()
app.use(cors())

//Data connection
const DB_URL = process.env.DB_URL
mongoose.connect(DB_URL).then((db, err) => {
    if (err) throw err
    else {
        console.log("DataBase is connected")
    }
})
let regex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/
//routes
//post route
//register user
app.post('/register', async (req, res) => {
    try {
        const { username, email, password, confirmPassword } = req.body
        const emailVaild = regex.test(email)
        const exists = await userModelData.findOne({ email })
        if (exists) {
            return res.status(400).json({ message: "email is already existed" })

        } else if (username === "") {
            return res.status(400).json({ message: "username is required" })
        } else if (email === "") {
            return res.status(400).json({ message: "email is required" })
        } else if (!emailVaild) {
            return res.status(400).json({ message: "email is not valid" })
        } else if (password === "") {
            return res.status(400).json({ message: "password is required" })
        } else if (confirmPassword==="") {
            return res.status(400).json({ message: "confirmPassword is required" })
        } else if (password !== confirmPassword) {
            return res.status(400).json({ message: "password didn't match" })
        }

        else {
            if (username && email && password && confirmPassword) {
                if (password === confirmPassword) {
                    try {
                        const salt = await bcrypt.genSalt(10)
                        const hashPassword = await bcrypt.hash(password, salt)
                        const newUser = new userModelData({
                            username: username,
                            email: email,
                            password: hashPassword,
                            confirmPassword: hashPassword
                        })
                        await newUser.save()

                        const payload = {
                            user: {
                                id: newUser.id
                            }
                        }

                        jwt.sign(payload, "jwtScret", { expiresIn: 36000000 }, (err, token) => {
                            if (err) throw err
                            else {
                                return res.status(200).json({ token, message: "Register success" })
                            }
                        })

                    } catch (e) {
                        console.log(e)
                    }
                }
            } else {
                return res.status(400).json({ message: "Failed" })
            }
        }

    } catch (e) {
        console.log(e)

    }

})

//login post

app.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body
        const exist = await userModelData.findOne({ email })
        if (!exist) {
            return res.status(400).json({ message: "email not existed" })
        } else if (email === "") {
            return res.status(400).json({ message: "email is required" })
        } else if (password === "") {
            return res.status(400).json({ message: "password is required" })
        } else {
            const matchPassword = await bcrypt.compare(password, exist.password)
            if (exist.email === email && matchPassword) {
                const payload = {
                    user: {
                        id: exist.id
                    }
                }
                jwt.sign(payload, "jwtSecret", { expiresIn: 360000000 }, (err, token) => {
                    if (err) throw err
                    else {
                        return res.status(200).json({ token, message: "login success" })
                    }
                })

            }

        }
    } catch (e) {
        console.log(e)
    }
})


//get
app.get('/myData', middleware, async (req, res) => {
    try {
        let existData = await userModelData.findById(req.user.id)

        if (!existData) {
            return res.status(404).json({ message: "user not found" })
        } else {
            const allData = await taskDataModel.find({})
            console.log(allData)
            return res.status(200).send(allData)

        }
    } catch (e) {
        console.log(e)
    }

})

//Tasks
//post api
app.post('/addTask', async (req, res) => {
    try {
        const { title, description } = req.body
        await taskDataModel.create(req.body)
        return res.status(200).json({ message: "Task is posted" })

    } catch (e) {
        console.log(e)
    }
})

//patch api/update 
app.patch('/addTask/:id', async (req, res) => {
    try {
        await taskDataModel.findByIdAndUpdate(req.params.id, req.body)
        return res.status(200).json({ message: "Task is Updated" })
    } catch (e) {
        console.log(e)
    }
})

//delete api

app.delete("/:id",async(req,res)=>{
    try{
        await taskDataModel.findByIdAndDelete(req.params.id)
        return res.status(200).json({message:"task is deleted"})

    }catch(e){
        console.log(e)
    }
})





app.listen(5000, () => {
    console.log("server runing at PORT 5000")
})