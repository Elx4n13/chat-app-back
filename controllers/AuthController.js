import { response } from "express";
import { User } from "../models/UserModel.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import {renameSync,unlinkSync} from "fs";
const maxAge = 3 * 24 * 60 * 60 * 1000;
const createToken = (email, userId) => {
  const token = jwt.sign({ email, userId }, process.env.JWT_SECRET, {
    expiresIn: maxAge,
  });
  return token;
};
export const signup = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Email and Password are required" });
    }
    const user = await User.create({ email, password });
    const token = createToken(user.email, user.id);
    
    return res.status(200).json({
      token,
      user: {
        id: user.id,
        email: user.email,
        profileSetup: user.profileSetups,
      },
    });
  } catch (error) {
    console.log({ error });
    return res.status(500).send("Internal Server Error");
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Email and Password are required" });
    }
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: "Invalid Email or Password" });
    
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: "Invalid Email or Password" });
    
    const token = createToken(user.email, user.id);
    
    return res.status(200).json({
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        image: user.image,
        profileSetup: user.profileSetups,
      },
    });
  } catch (error) {
    console.log({ error });
    return res.status(500).send("Internal Server Error");
  }
};
export const getUserInfo = async (req, res, next) => {
  try {
    const userData = await User.findById(req.userId);
    if (!userData) return res.status(404).json({ message: "User not found" });
    return res.status(200).json({
      user: {
        id: userData.id,
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        image: userData.image,
        color: userData.color,
        profileSetup: userData.profileSetups,
      },
    });
  } catch (error) {
    console.log({ error });
    return res.status(500).send("Internal Server Error");
  }
};
export const updateProfile = async (req, res, next) => {
  try {
    const { userId } = req;
    const { firstName, lastName, color } = req.body;
    if (!firstName || !lastName || color === null || color === undefined) {
      return res.status(400).json({ message: "All fields are required" });
    }
    const userData = await User.findByIdAndUpdate(
      userId,
      { firstName, lastName, color, profileSetups: true },
      { new: true, runValidators: true }
    );
    return res.status(200).json({
      user: {
        id: userData.id,
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        image: userData.image,
        color: userData.color,
        profileSetup: userData.profileSetups,
      },
    });
  } catch (error) {
    console.log({ error });
    return res.status(500).send("Internal Server Error");
  }
};
export const addProfileImage = async (req, res, next) => {
  try {
    if(!req.file) return res.status(400).json({ message: "No file uploaded" });
    const date = Date.now();
    let fileName = "uploads/profiles/" + date + req.file.originalname;
    renameSync(req.file.path, fileName);
    const updatedUser = await User.findByIdAndUpdate(req.userId, { image: fileName }, { new: true, runValidators: true });
    return res.status(200).json({
    
        image: updatedUser.image,
      
    });
  } catch (error) {
    console.log({ error });
    return res.status(500).send("Internal Server Error");
  }
};
export const removeProfileImage = async (req, res, next) => {
  try {
    const { userId } = req;
    const user = await User.findById(userId);
    if(!user){
      return res.status(404).json({ message: "User not found" });
    }
   if(user.image){
    unlinkSync(user.image);
   }
   user.image = null;
   await user.save();
   return res.status(200).json({
    message: "Image removed successfully",
   });
  } catch (error) {
    console.log({ error });
    return res.status(500).send("Internal Server Error");
  }
};
export const logout = async (req, res, next) => {
  try {
    res.cookie("jwt","",{maxAge:1,secure:true,sameSite:"None"});
    return res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.log({ error });
    return res.status(500).send("Internal Server Error");
  }
};