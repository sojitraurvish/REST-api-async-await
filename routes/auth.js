const express=require("express");
const {body}=require("express-validator/check");

const User=require("../models/user");
const authController=require("../controllers/auth");

const route=express.Router();

route.put("/signup",[
    body("email")
        .isEmail()
        .withMessage("Please enter valid email!.")
        .custom((emailValue,{req})=>{
            return User.findOne({email:emailValue})
                .then(userDoc=>{
                    if (userDoc){
                        return Promise.reject("E-mail address already exists!");
                    }
                });
        })
        .normalizeEmail(),
    body("password").trim().isLength({min:5}),
    body("name").trim().not().isEmpty()
],authController.signup);

route.post("/login",authController.login);

module.exports.routes=route;