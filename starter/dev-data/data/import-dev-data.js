const fs = require('fs')
const mongoose = require('mongoose')
const dotenv = require('dotenv')
const Tour = require('./../../../models/tourModel')         //directories*


dotenv.config({ path: './config.env' })

const DB = process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD)

mongoose.connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false
}).then(() =>
    console.log('DB connection succesful!'))

//read JSON file
const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours-simple.json`, 'utf-8'))

//import Data into DB
const importData = async () => {
    try {
        await Tour.create(tours)
        console.log('data succesfully loaded!')
    } catch (err) {
        console.log(err)
    }
    process.exit()
}

//delete all data from collection
const deleteData = async () => {
    try {
        await Tour.deleteMany()
        console.log('data succesfully deleted!')
    } catch (err) {
        console.log(err)
    }
    process.exit()
}

if(process.argv[2] === '--import'){
    importData()
}else if (process.argv[2] === '--delete'){
    deleteData()
}
