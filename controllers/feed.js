const {validationResult}=require("express-validator/check");

const fs=require("fs");
const path=require("path");

const Post=require("../models/post");
const User=require("../models/user");

//after Releasing of version 14 of node we can use await keyword also outside of async function and this Fechner call Top Level aWait
//await //here 

module.exports.getPosts=async (req,res,next)=>{
    const currentPage=req.query.page || 1;
    const perPage=2;
    try{
        let totalItems=await Post.find().countDocuments()
        const posts=await Post.find()
                .skip((currentPage-1)* perPage)
                .limit(perPage);
        
        if(posts){

            res.status(200).json({
                message:"Fetched Posts Successfully!..",
                posts:posts,
                totalItems:totalItems
            });
        }
    }catch(err){
        if(!err.statusCode){
            err.statusCode=500;
        }
        next(err);
    }
    // .catch((err)=>{
    //     if(!err.statusCode){
    //         err.statusCode=500;
    //     }
    //     next(err);
    // });
}
module.exports.createPost=(req,res,next)=>{
    
    const errors=validationResult(req);

    if(!errors.isEmpty()){
        const error=new Error("validation failed, entered data is incorrect.");
        error.statusCode=422;
        throw error;
        
    }

    if(!req.file){
        const error=new Error("No image provided!.");
        error.statusCode=422;
        throw error;
    }

    //create post in db
    const title=req.body.title;
    const content=req.body.content;
    const imageUrl=req.file.path;
    
    let creator;

    const post=new Post({
        title:title,
        content:content,
        imageUrl:imageUrl,
        creator:req.userId
    });

    post.save()
    .then((result)=>{
        if(result){
            return User.findById(req.userId);
        }
    })
    .then((user)=>{
        creator=user;
        user.posts.push(post);
        return user.save();
    })
    .then((result)=>{
        if(result)
        {
            res.status(201).json({
                message:"post is created successfully!",
                post:post,
                creator:{_id:creator._id,name:creator.name}
            });
        }
    })
    .catch((err)=>{
        if(!err.statusCode){
            err.statusCode=500;
        }
        next(err);
    });

    
}

exports.getPost=(req,res,next)=>{
    const postId=req.params.postId;
    Post.findById(postId)
    .then((post)=>{
        if(!post){
            const error=new Error("Could not find post.");
            error.statusCode=404;
            throw error;  
            return;
        }
        console.log(post);
        res.status(200).json({
            message:"Post fetched.",
            post:post
        });
    })
    .catch((err)=>{
        if(!err.statusCode){
            err.statusCode=500;
        }
        next(err);
    })
}

module.exports.updatePost=(req,res,next)=>{
    const postId=req.params.postId;

    const errors=validationResult(req);

    if(!errors.isEmpty()){
        const error=new Error("validation failed, entered data is incorrect.");
        error.statusCode=422;
        throw error;
    }

    const title=req.body.title;
    const content=req.body.content;
    let imageUrl=req.body.image;
    if(req.file){
        imageUrl=req.file.path;
    }

    if(!imageUrl){
        const error=new Error("No file pocked");
        error.statusCode=422;
        throw error;
    }

    Post.findById(postId)
    .then(post=>{
        if(!post)
        {
            const error=new Error("Could not find post");
            error.statusCode=404;
            throw error;
            return;
        }
        if(post.creator.toString()!==req.userId){
            const error=new Error("Not authorized");
            error.statusCode=403;
            throw error;  
        }
        if(imageUrl!==post.imageUrl)
        {
            clearImage(post.imageUrl);
        }
        post.title=title;
        post.imageUrl=imageUrl;
        post.content=content;
        return post.save();
    })
    .then(result=>{
        // if(result){
            return res.status(200).json({message:"Post Updated!",post:result});
        // }
        //     const error=new Error("Could not update post");
        //     error.statusCode=404;
        //     throw error;
    })
    .catch((err)=>{
        if(!err.statusCode){
            err.statusCode=500;
        }
        next(err);
    })
}

const clearImage = filePath =>{
    filePath=path.join(__dirname,"..",filePath);
    fs.unlink(filePath,err=>{console.log(err);});
};

module.exports.deletePost=(req,res,next)=>{
    const postId=req.params.postId;
    Post.findById(postId)
    .then(post=>{
        if(!post){
            const error=new Error("Could not find post.");
            error.statusCode=404;
            throw error;
        }
        if(post.creator.toString()!==req.userId){
            const error=new Error("Not authorized");
            error.statusCode=403;
            throw error;  
        }

        clearImage(post.imageUrl);
        return Post.findByIdAndRemove(postId);
    })
    .then(result=>{
        if(result)
        {
            return User.findById(req.userId);
            
        }
    })
    .then(user=>{
        user.posts.pull(postId);
        return user.save();
       
    })
    .then(result=>{
         // console.log(result);
         res.status(200).json({message:"Deleted post"});
    })
    .catch((err)=>{
        if(!err.statusCode)
        {
            err.statusCode=500;
        }
        next(err);
    });
}
