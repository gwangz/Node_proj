const express = require('express')
const userController = require('./../controllers/userController')

const router = express.Router()        //used userRouter and got an error

router.route('/').get(userController.getAllUsers).post(userController.createUser)

router.route('/:id').get(userController.getUser).patch(userController.updateUser)

module.exports = router