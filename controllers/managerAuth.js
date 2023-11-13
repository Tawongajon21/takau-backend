const Manager = require('../models/Manager');
const {GeneratePassword, ValidatePassword, generateSignature,GenerateSalt}= require("../utils/index")

const ManagerSignup=async(req,res)=>{
    const {email,phone,password,name,surname}=req.body;

     const salt= await GenerateSalt()
    
        const existingCustomer= await Manager.findOne({email});
        const userPassword= await GeneratePassword(password,salt)
      
            if (existingCustomer) {
                res.status(401).json({
                    msg:"Email already in use"
                })
            }
            else if(!existingCustomer){
                const newUser= await Manager.create({
                   name,email,password:userPassword,phone,salt,surname
                });
                if (newUser) {
                  const signature=await generateSignature({
                    _id:newUser._id,
                    email:newUser.email,
                    phone:newUser.phone,
                    isAdmin:newUser.isAdmin,
        
                  })  
                  res.status(201).json({
                  signature,email:newUser.email,phone:newUser.phone,isAdmin:newUser.isAdmin,name:newUser.name,
                surname:newUser.surname
                })
                   
        
                }
        
            }
            else{
        
                res.status(500).json({msg:"server error"})
        
            }
    
}
const ManagerSignin=async(req,res)=>{
    const {email,password}= req.body;
    const existingAdmin=await Manager.findOne({email:email});
 try {
     if (!existingAdmin) {
         res.status(401).json({msg:"User does not exist please sign up"})
        } else {
         const response=await ValidatePassword(password,existingAdmin.password,existingAdmin)
         if (response==="wrong details") {
             res.status(401).json({
                 msg:"Wrong email or password"
             })
                 }
                 else{
                     const signature=await generateSignature({
                         _id:existingAdmin._id,
                         email:existingAdmin.email,
                         phone:existingAdmin.phone,
                         isAdmin:existingAdmin.isAdmin,
                     })
                     res.status(201).json({
                      
                    
                         signature:signature,
                         _id:existingAdmin._id,
                         email:existingAdmin.email,
                         phone:existingAdmin.phone,
                         isAdmin:existingAdmin.isAdmin,
                     })
                 }
        }
 } catch (error) {
     res.status(500).json({msg:"Server error"})
 }
 
    
}

const EditManagerProfile=async(req,res)=>{
    const user=req.user;
    if (user) {
        const existingCustomer =await Manager.findByIdAndUpdate(user._id,{$set:req.body},{new:true})
        res.json(existingCustomer)
      }
      else{
          return res.json({"msg":"Customer information not found"})
      }
}
const GetManagerProfile =async(req,res)=>{
    const user=req.user;
    if (user) {
      const existingManager =await Manager.findById(user._id)
      return res.json(existingManager)
    }
    else{
    return res.json({"msg":"Manager profile not found"})
    }
}


module.exports={
   ManagerSignin,ManagerSignup,EditManagerProfile,GetManagerProfile
}

