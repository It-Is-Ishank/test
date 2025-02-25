import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

const userSchema = new mongoose.Schema(
    {
        username: {
            type : String,
            required : [true,"username is required"],
            unique : [true,"username is already taken"],
            lowercase : true,
            trim : true,
            index : true,
        },
        email: {
            type : String,
            required : [true,"email is required"],
            unique : [true,"user with this email already exists"],
            lowercase : true,
            trim : true,
        },
        fullname: {
            type : String,
            required : true,
            trim : true,
            index : true,
        },
        avatar: {
            type : String, // cloudinary url
            required : true,
        },
        coverImage : {
            type : String, // cloudinary url
        },
        watchHistory: [
            {
                type : mongoose.Schema.Types.ObjectId,
                ref : "Video"
            }
        ],
        password: {
            type : String,
            required : true,
        },
        refreshToken: {
            type : String,
        }
    },
    {
        timestamps : true
    })

userSchema.pre("save", async function (next) {
    if(!this.isModified("password")) return next()

    this.password = await bcrypt.hash(this.password,10)
    next()
})

userSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password,this.password)
}


userSchema.methods.generateAccessToken = function () {
    console.log("access token secret: ",process.env.ACCESS_TOKEN_SECRET);
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            username: this.username,
            fullname: this.fullname,
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }

    )
}
userSchema.methods.generateRefreshToken = function () {
    console.log("refresh token secret: ",process.env.REFRESH_TOKEN_SECRET)
    return jwt.sign(
        {
        _id: this._id,
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }

    )
}

export const User = mongoose.model("User",userSchema);