const jwt=require("jsonwebtoken");

module.exports=(req,res,next)=>{
    const authHeader=req.get("Authorization");
    if(!authHeader){
        const error=new Error("Not Authenticated");
        error.statusCode=401;
        throw error;
    }
    const token=authHeader.split(" ")[1];
    let decodedToken;

    try{//here we have to verify do two thing decode token and verify that token and this verify method do both take at once
        decodedToken=jwt.verify(token,"thisismyprivetesecret");

    }catch(err){
        err.statusCode=500;
        throw err;
    }
    if(!decodedToken){
        const error=new Error("Not Authenticated!...");
        err.statusCode=500;
        throw error;
    }
    req.userId=decodedToken.userId;
    next();
};