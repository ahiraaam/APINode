const express = require("express")

const { body } = require('express-validator')

const router = express.Router()

const feedController = require('../controllers/feed')
const isAuth = require('../middleware/isAuth')
//GET /feed/post
router.get('/post', isAuth, feedController.getPosts)

router.post('/post',[
    body('title')
        .trim()
        .isLength({min:5}),
    body('content')
        .trim()
        .isLength({min:5})
    ], isAuth, feedController.createPost)

router.get('/post/:postId',isAuth, feedController.getSinglePost)

router.put('/post/:postId',[
    body('title')
        .trim()
        .isLength({min:5}),
    body('content')
        .trim()
        .isLength({min:5})
    ], isAuth, feedController.editPost)

router.delete('/post/:postId', isAuth, feedController.deletePost);

module.exports = router