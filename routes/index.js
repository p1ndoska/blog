const express = require('express');
const router = express.Router();
const multer = require('multer');
const {UserController} = require("../controllers");
const {PostController} = require("../controllers");
const {authenticationToken} = require("../middleware/auth");

const uploadDestination =('uploads');
const storage = multer.diskStorage({
    destination: uploadDestination,
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    }
});

const upload = multer({ storage: storage });

router.post('/register',UserController.register);
router.post('/login', UserController.login);
router.get('/current', authenticationToken, UserController.current);
router.get('/users/:id', authenticationToken,UserController.getUserById);
router.put('/users/:id', authenticationToken, UserController.updateUser);

//post
router.post('/post', authenticationToken, PostController.addPost);
router.get('/post', authenticationToken, PostController.getPosts);
router.get('/post/:id', authenticationToken, PostController.getPostById);
router.put('/post/:id', authenticationToken, PostController.updatePost);
router.delete('/post/:id', authenticationToken, PostController.deletePost);


module.exports = router;