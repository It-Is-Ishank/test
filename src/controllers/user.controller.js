import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js"; 
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const registerUser = asyncHandler(async (req, res, next) => {
    // get user data
    // data validation - not empty
    // check if user exists already
    // check images, avatar
    // upload to cloudinary
    // create user object
    // remove password, refreshToken from response
    // check for user creation
    // return response

    const { fullname, username, email, password } = req.body;
    console.log(req.body);
    console.log(req.files);

    if(
        [fullname, username, email, password].some((field) =>
        field?.trim() === "")
    ){
        throw new ApiError(400, "All fields are required")
    }

    const existedUser = await User.findOne({ 
        $or: [{ email },{username: username.toLowerCase()}]
    })

    if(existedUser){
        console.log(existedUser)
        console.log("user exists")
        throw new ApiError(409, "User with this email or username already exists")
    }

    const avatarLocalPath = req.files?.avatar[0]?.path;
    const coverImageLocalPath = req.files?.coverImage[0]?.path;

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar is required")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if(!avatar){
        throw new ApiError(500, "Failed to upload images")
    }

    const user = await User.create({
        fullname,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        username : username.toLowerCase()
    })

    const createdUser = await User.findById(user._id).select("-password -refreshToken")

    if(!createdUser){
        throw new ApiError(500, "Failed to create user")
    }

    console.log("user created")
    
    return res.status(201).json(
        new ApiResponse(200,createdUser, "User created successfully")
    )

    



});

export { registerUser };