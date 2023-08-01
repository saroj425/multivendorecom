const express = require("express");
const path= require("path");
const router = express.Router();
const User = require("../model/user")
const {upload} = require("../multer")
const ErrorHandler = require("../utils/ErrorHandler")
const catchAsyncErrors = require("../middleware/catchAsyncErrors")
const jwt = require("jsonwebtoken");
const fs = require("fs");
const sendMail = require("../utils/sendMail");
const sendToken = require("../utils/jwtToken");

router.post("/create-user", upload.single("file"), async (req, res, next) => {
    try {
      const { name, email, password } = req.body;
      const userEmail = await User.findOne({ email });
  
    //   if (userEmail) {
    //     const filename = req.file.filename;
    //     const filePath = `uploads/${filename}`;
    //     fs.unlink(filePath, (err) => {
    //       if (err) {
    //         console.log(err);
    //         res.status(500).json({ message: "Error deleting file" });
    //       }
    //     });
    //     return next(new ErrorHandler("User already exists", 400));
    //   }
    if (userEmail) {
        const filename = req.file.filename;
        const filePath = `uploads/${filename}`;
        fs.unlink(filePath, (err) => {
          if (err) {
            console.log(err);
            res.status(500).json({ message: "Error deleting file" });
          }
        });
        // return next(new ErrorHandler("User already exists", 400));
        return res.status(400).json({
          message:"User already exists"
        });
      }
  
      const filename = req.file.filename;
      const fileUrl = path.join(filename);
  
      const user = {
        name: name,
        email: email,
        password: password,
        avatar: fileUrl,
      };
  
      const activationToken = createActivationToken(user);  
      const activationUrl = `http://localhost:3000/activation/${activationToken}`;  
      try {
        await sendMail({
          email: user.email,
          subject: "Activate your account",
          message: `Hello ${user.name}, please click on the link to activate your account: ${activationUrl}`,
        });
        res.status(201).json({
          success: true,
          message: `please check your email:- ${user.email} to activate your account!`,
        });
      } catch (error) {
        return next(new ErrorHandler(error.message, 500));
      }
    } catch (error) {
      return next(new ErrorHandler(error.message, 400));
    }
  });
  
  // create activation token
  const createActivationToken = (user) => {
    return jwt.sign(user, process.env.ACTIVATION_SECRET, {
      expiresIn: "5m",
    });
  };
  
  // activate user
  router.post(
    "/activation",
    catchAsyncErrors(async (req, res, next) => {
      try {
        const { activation_token } = req.body;
  
        const newUser = jwt.verify(
          activation_token,
          process.env.ACTIVATION_SECRET
        );
  
        if (!newUser) {
          return next(new ErrorHandler("Invalid token", 400));
        }
        const { name, email, password, avatar } = newUser;
  
        let user = await User.findOne({ email });
  
        if (user) {
          return next(new ErrorHandler("User already exists", 400));
        }
        user = await User.create({
          name,
          email,
          avatar,
          password,
        });
  
        sendToken(user, 201, res);
      } catch (error) {
        return next(new ErrorHandler(error.message, 500));
      }
    })
  );

  //Login User

  router.post("/login-user",catchAsyncErrors(async(req,res,next)=>{
    try {
        const {email,password} = req.body
        if(!email || !password){
          return next(new ErrorHandler("Please fill all fields !", 400));
        }
        const user = await User.findOne({email}).select("+password");
        if(!user){
          return res.status(400).json({
            message:"User does not  exist"
          });
        }
        const isPasswordVaild = await user.comparePassword(password);
        if(!isPasswordVaild){
          // return next(new ErrorHandler("Password is not valid", 400));
          return res.status(400).json({
            message:"Password is not valid"
          });
        }
        sendToken(user,201,res);

    } catch (error) {
      
    }
  })
  );

module.exports = router