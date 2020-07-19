const path = require('path')
const express = require("express")
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const multer =  require('multer') //for images
const feedRoutes = require('./routes/feed')
const authRoutes = require('./routes/auth')

const app = express()

//For file storage 
const fileStorage = multer.diskStorage({
    destination: (req,file,cb) =>{
        cb(null, 'images')
    },
    filename: (req,file,cb)=>{
        cb(null, new Date().toISOString() + '-' + file.originalname)
    }
})

const fileFilter = (req, file, cb) => {
    if(file.mimetype == 'image/png' || file.mimetype == 'image/jpg' || file.mimetype == 'image/jpeg'){
        cb(null, true)
    }else{
        cb(null, false)
    }

}

//To parse json data
app.use(bodyParser.json()) //application/json

//For images uploading
app.use(multer({ storage: fileStorage, fileFilter: fileFilter}).single('image'))
//For images
app.use('/images', express.static(path.join(__dirname, 'images')))

//Add headers for CORS
app.use((req,res,next)=>{
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next()
})

app.use('/feed', feedRoutes)
app.use('/auth', authRoutes)

//For error handling
app.use((error,req,res,next)=>{
    console.log(error);
    const status = error.statusCode;
    const message = error.message
    const data = error.data
    res.status(status).json({
        message: message,
        data: data
    })
})

mongoose.connect('mongodb+srv://ahiram:gala2312@cluster0-htqnp.mongodb.net/blog?retryWrites=true&w=majority')
    .then(result => {
        const server = app.listen(8080)
        //Connection to socket.io
        const io  = require('./socket.js').init(server)
        //Conecction between socket and client
        io.on('connection', socket => {
            console.log("Client connected")
        })
    })
    .catch(err => {
        console.log(err)
        console.log("faaail")

    })
