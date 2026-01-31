const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const mongoose = require('mongoose');
const {User, EmailVerification} = require('../models/user.model');

const register = async(req, res) => {
    try{
        const {email, password} = req.body;
        if(await User.findOne({email: email})){
            return res.status(403).json({message: 'Email in use'});
        }
        const hashed = await bcryptjs.hash(password, 10);
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        await new EmailVerification({
            email,
            code,
            expiresAt: Date.now() + 600000
        }).save();

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL,
                pass: process.env.EMAIL_PASSWORD
            }
        });
        
        await transporter.sendMail({
            from: process.env.EMAIL,
            to: email,
            subject: 'Verify your email',
            text: `Your verification code is: ${code}`
        });

        const user = await new User({
            email: email,
            password: hashed
        }).save();


        res.status(201).json({message: 'User created'});
    }
    catch(e){
        return res.status(500).json({error: e.message});
    }
}

const login = async(req, res) => {
    try{
        const {email, password} = req.body;
        const user = await User.findOne({email: email});
        if(!user || !(await bcryptjs.compare(password, user.password))){
            return res.status(401).json({message: 'Email or password is incorrect'});
        }
        if(!user.isVerified){
            return res.status(403).json({message: 'Please verify your email first'});
        }
        const token = jwt.sign({userId: user._id}, process.env.JWT_SECRET, {expiresIn: '7d'});
        return res.status(200).json({message: 'Login successfully', token});

        //logout by calling localStorage.removeItem('token');
    }
    catch(e){
        return res.status(500).json({error: e.message});
    }
}

const verifyEmail = async(req, res) => {
    try{
        const {email, code} = req.body;
        const verification = await EmailVerification.findOne({email});
        
        if(!verification){
            return res.status(400).json({message: 'Invalid code'});
        }

        if(verification.expiresAt < Date.now()){
            return res.status(400).json({message: 'Code expired'});
        }

         if(verification.attempts >= 5){
            await EmailVerification.deleteOne({_id: verification._id});
            return res.status(400).json({message: 'Too many attempts'});
        }

        if(verification.code !== code){
            verification.attempts += 1;
            await verification.save();
            return res.status(400).json({
                message: 'Invalid code', 
                attemptsLeft: 5 - verification.attempts
            });
        }

        await User.updateOne({email}, {isVerified: true});
        await EmailVerification.deleteOne({_id: verification._id});
        
        res.status(200).json({message: 'Email verified'});
    }
    catch(e){
        res.status(500).json({error: e.message});
    }
}

const verifyToken = (req, res, next) => {
    try{
        const token = req.headers['authorization']?.split(' ')[1];
        if(!token) return res.status(403).json({message: 'No token provided'});
        
        jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
            if(err) return res.status(401).json({message: 'Invalid token'});
            req.userId = decoded.userId;
            next();
        });
    }
    catch(e){
        res.status(500).json({error: e.message});
    }
}

const getUsers = async(req, res) => {
    try{
        const users = await User.find();
        return res.status(200).json(users);
    }
    catch(e){
        return res.status(500).json({error: e.message});
    }
}

module.exports = {register, login, verifyEmail, verifyToken};

