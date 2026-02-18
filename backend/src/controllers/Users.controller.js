import httpStatus from "http-status";
import User from "../models/User.model.js";
import bcrypt from "bcrypt";
import crypto from "crypto";

/* -------------------- ADD TO ACTIVITY -------------------- */
export const addToActivity = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(httpStatus.UNAUTHORIZED).json({
        message: "No token provided",
      });
    }

    const token = authHeader.split(" ")[1]; // remove 'Bearer '

    const { meeting_code } = req.body;

    if (!meeting_code) {
      return res.status(httpStatus.BAD_REQUEST).json({
        message: "Meeting code is required",
      });
    }

    const user = await User.findOne({ token });

    if (!user) {
      return res.status(httpStatus.UNAUTHORIZED).json({
        message: "Invalid token",
      });
    }

    // store meeting history
    if (!user.meetings) {
      user.meetings = [];
    }

    user.meetings.push(meeting_code);
    await user.save();

    return res.status(httpStatus.OK).json({
      message: "Meeting added successfully",
    });

  } catch (error) {
    return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      message: "Server error",
    });
  }
};


/* -------------------- LOGIN -------------------- */
export const login = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(httpStatus.BAD_REQUEST).json({
      message: "Username and password are required",
    });
  }

  try {
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(httpStatus.NOT_FOUND).json({
        message: "User not found",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(httpStatus.UNAUTHORIZED).json({
        message: "Invalid credentials",
      });
    }

    const token = crypto.randomBytes(20).toString("hex");

    user.token = token;
    await user.save();

    return res.status(httpStatus.OK).json({ token });

  } catch (error) {
    return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      message: `Something went wrong: ${error.message}`,
    });
  }
};


/* -------------------- REGISTER -------------------- */
export const register = async (req, res) => {
  const { name, username, password } = req.body;

  if (!name || !username || !password) {
    return res.status(httpStatus.BAD_REQUEST).json({
      message: "All fields are required",
    });
  }

  try {
    const existingUser = await User.findOne({ username });

    if (existingUser) {
      return res.status(httpStatus.CONFLICT).json({
        message: "Username already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name,
      username,
      password: hashedPassword,
      meetings: [],
    });

    await newUser.save();

    return res.status(httpStatus.CREATED).json({
      message: "User registered successfully",
    });

  } catch (error) {
    return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      message: `Something went wrong: ${error.message}`,
    });
  }
};
