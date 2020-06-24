const User = require('../models/user')
const { validationResult } = require('express-validator/check')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

exports.signup = (req,res,next) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        const error = new Error(' Validation incorrect ')
        error.statusCode = 422;
        error.data = errors.array() //to pase original errors
        throw error
    }
    const email = req.body.email
    const name = req.body.name
    const password = req.body.password

    bcrypt.hash(password, 12)
    .then(hashedPassword => {
        const user = new User({
            email: email,
            name: name,
            password: hashedPassword
        })
        return user.save()
    }).then(result => {
        res.status(201).json({
            message: 'User Created',
            userId: result._id
        })
    }).catch(err => {
        if(!err.statusCode){
            err.statusCode = 500
        }
        next(err)
    })
}

exports.login = (req,res,next)  => {
    const email = req.body.email
    const password = req.body.password
    let loadedUser;
    User.findOne({email: email})
    .then(user => {
        if(!user){
            const error = new Error('User does not exist');
            error.statusCode = 401;
            throw error
        }
        loadedUser = user
        return bcrypt.compare(password, user.password)
    })
    .then(isEqualPassword => {
        if(!isEqualPassword){
            const error = new Error('Wrong password');
            error.statusCode = 401;
            throw error
        }
        const token = jwt.sign(
            {
                email: loadedUser.email,
                userId: loadedUser._id.toString()
            }, 
            'secret', 
            {expiresIn: '1h'}
        );
        return res.status(200).json({
            message: 'Loged in',
            token: token,
            userId: loadedUser._id.toString()
        })
    })
    .catch(error =>{
        console.log(error)
        if(!error.statusCode){
            error.statusCode = 500
        }
        next(error)
    })
}

exports.getUserStatus = (req,res,next) =>{
    User.findById(req.userId)
    .then(user => {
        if(!user){
            const error = new Error('User does not exist');
            error.statusCode = 401;
            throw error
        }
        res.status(200).json({
            status: user.status
        })
    })
    .catch(error =>{
        console.log(error)
        if(!error.statusCode){
            error.statusCode = 500
        }
        next(error)
    })
}

exports.updateUserStatus = (req,res,next) => {
    const newStatus = req.body.status

    User.findById(req.userId)
    .then(user => {
        if(!user){
            const error = new Error('User does not exist');
            error.statusCode = 401;
            throw error
        }
        user.status = newStatus

        return user.save()
    })
    .then(result => {
        res.status(200).json({
            message: 'User status updated'
        })
    })
    .catch(error =>{
        console.log(error)
        if(!error.statusCode){
            error.statusCode = 500
        }
        next(error)
    })
}