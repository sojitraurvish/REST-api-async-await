const express=require("express");
const {body}=require("express-validator/check");

const feedController=require("../controllers/feed");
const isAuth=require("../middleware/is-auth");

const route=express.Router();

// GET : /feed/posts
route.get("/posts",isAuth,feedController.getPosts);

// POST : /feed/post
route.post("/post",isAuth,[
    body("title").trim().isLength({min:5}),
    body("content").trim().isLength({min:5})
],feedController.createPost);

// GET : /feed/post/:postId
route.get("/post/:postId",isAuth,feedController.getPost);

// PUT : /feed/post/:postId
route.put("/post/:postId",isAuth,[
    body("title").trim().isLength({min:5}),
    body("content").trim().isLength({min:5})
],feedController.updatePost);

// DELETE : /feed/post/:postId
route.delete("/post/:postId",isAuth,feedController.deletePost);

module.exports.routes=route;