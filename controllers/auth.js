const {validationResult}=require("express-validator/check");
const bcrypt=require("bcryptjs");
const jwt=require('jsonwebtoken');

const User=require("../models/user");

module.exports.signup=(req,res,next)=>{
    const errors=validationResult(req);
    if(!errors.isEmpty())
    {
        const error=new Error("Validation Failed!");
        error.statusCode=422;
        error.data=errors.array();
        throw error;
    }
    const email=req.body.email;
    const name=req.body.name;
    const password=req.body.password;

    bcrypt.hash(password,12)
    .then(hashPassword=>{
        if(hashPassword)
        {
            const user=new User({
                email:email,
                password:hashPassword,
                name:name
            });
            return user.save();
        }
    })
    .then(result=>{
        if(result)
        {
            res.status(201).json({message:"User Created!",userId:result._id});
        }
    })
    .catch(err=>{
        if(!err.statusCode){
            err.statusCode=500;
        }
        next(err);
    })

}

module.exports.login=(req,res,next)=>{
    const email=req.body.email;
    const password=req.body.password;
    let loadedUser;

    User.findOne({email:email})
    .then(user=>{
        if(!user)
        {
            const error=new Error("A user with this email could not be found");
            error.statusCode=401;//
            throw error;
        }
        loadedUser=user;
        return bcrypt.compare(password,user.password);
    })
    .then(isEqual=>{
        if(!isEqual){
            const error=new Error("Wrong password!");
            error.statusCode=401;
            throw error;
        }
        const token=jwt.sign({
            email:loadedUser.email,
            userId:loadedUser._id.toString()
        },
        "thisismyprivetesecret",//as second argument i have to pass secrete key
        {expiresIn:"1h"}//as third argument i have to pass expiration time ,here you can pass time like 1h => 1hour ,1s => 1 second
        );
        res.status(200).json({token:token,userId:loadedUser._id.toString()});  
    })
    .catch(err=>{
        if(!err.statusCode){
            err.statusCode=500;
        }
        next(err);
    }); 

}