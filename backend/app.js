const express = require('express')
const cors = require('cors')
const mongoose = require('mongoose')
const path = require('path')
const app = express()
const fs = require('fs')
const config = require('config')
const db_config = config.get('db')

app.use(express.json())

app.use('/uploads', express.static('uploads'))

//Route handlers
const category_route = require('./routes/category')

app.set('trust proxy', 1);
 
//Routes
app.use('/api/category', category_route)

//Mongoose
const MONGO_HOSTNAME = db_config.host_dev
const MONGO_PORT = db_config.port
const MONGO_DB = db_config.db
mongoose.set('useFindAndModify', false)
mongoose.set('useCreateIndex', true)

let mongourl = `mongodb://${MONGO_HOSTNAME}:${MONGO_PORT}/${MONGO_DB}?authSource=admin`
mongoose.connect(mongourl, { useNewUrlParser: true , useUnifiedTopology: true })
.then(() => {
	console.log("Connected to MongoDB")
}).catch((err) => {
	console.log(`Error in connecting to database ${err}`)
})

//Setting up WebServer
const port = 6500
const server = app.listen(port, async() => {
	console.log(`Running on Port ${port}`)
})