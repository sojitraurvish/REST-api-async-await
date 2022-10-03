const express=require("express");
const bodyParser=require("body-parser");
const mongoose=require("mongoose");
const multer=require("multer");

const path=require("path");

const feedRoutes=require("./routes/feed");
const authRoutes=require("./routes/auth");

const app=express();

const fileStorage=multer.diskStorage({
    destination:(req,file,cb)=>{
        cb(null,"images");
    },
    filename:(req,file,cb)=>{
        var timestamp = new Date().toISOString().replace(/[-:.]/g,""); 
        cb(null,timestamp+"_"+file.originalname);
    }
});

const fileFilter=(req,file,cb)=>{
    if(
        file.mimetype === "image/png" ||
        file.mimetype === "image/jpg" ||
        file.mimetype === "image/jpeg" 
    ){
        cb(null,true);
    }else{
        cb(null,false);
    }
}

// app.use(bodyParser.urlencoded({extended:false}));
// x-www-form-urlencoded fro <form> submit data
app.use(bodyParser.json())// application/json

app.use(multer({storage:fileStorage,fileFilter:fileFilter}).single("image"));

app.use("/images",express.static(path.join(__dirname,'images')));

app.use((req,res,next)=>{//middleware for if you have different server so for backend api(localhost:8080/) and fronted code  https://codepen.io/pen/?editors=1011 so they are different server and to make communication among them use this middleware 
    res.setHeader("Access-Control-Allow-Origin","*")//add new header
    //here use add domain for that you want to give access ex. codepen.io or instead of that you can specifies wildcard * to give access to all domain 

    res.setHeader("Access-Control-Allow-Methods","GET,POST,PUT,PATCH,DELETE");//here you specifies method that you want to allow
    //Here OPTION method send before other request check that request is allowed (define above) or not
    
    res.setHeader("Access-Control-Allow-Headers","Content-Type,Authorization");//here you can specifies header or wildcard * to which you want to give access and with this line we allow to set content type on client side and we sow that it was important
    next();
});//by help of this middleware we can define every thing which we want to access at client side now every response that we send those will have this headers

app.use("/feed",feedRoutes.routes);
app.use("/auth",authRoutes.routes);

app.use((error,req,res,next)=>{
    console.log(error);
    const status=error.statusCode || 500;
    const message=error.message;
    const data=error.data;
    res.status(status).json({message:message,data:data});
});

mongoose.connect("mongodb+srv://urvish:urvish@ecom.mehbxhu.mongodb.net/restApi?retryWrites=true&w=majority")
.then((result)=>{
    if(result){
        console.log("DB Connected!...");
        app.listen(8080,'localhost',()=>{
            console.log("Server is created at port 8080");
        });
        return;
    }
    console.log("DB not Connected!...");
})
.catch((err)=>{
    console.log(err);
});

// https://codepen.io/pen/?editors=10111
//frontend code
{/* <button id="get">Get Posts</button>
<button id="post">Create a post</button>  */}

// const getButton=document.getElementById('get');
// const postButton=document.getElementById("post");

// getButton.addEventListener('click',()=>{
//   fetch('http://localhost:8080/feed/posts')
//     .then((res)=>{
//     return res.json();
//   })
//   .then((resData)=>{console.log(resData);})
//     .catch((err)=>{console.log(err);});
// });

// postButton.addEventListener("click",()=>{
//   fetch("http://localhost:8080/feed/post",{
//      method:"POST",
//      body:JSON.stringify({
//        title:"A Codepen Post",
//        content:"Creted via Codepen"
//      }),
//     headers:{
//       "Content-Type":"application/json"
//     }
    
//   })
//   .then((res)=>{
//     return res.json();
//   })
//   .then((resData)=>{
//     console.log(resData);
//   })
//   .catch((err)=>{console.log(err);});
// });
