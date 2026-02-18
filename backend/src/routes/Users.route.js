import express from "express";
import {
  login,
  register,
  addToActivity
} from "../controllers/Users.controller.js";

const router = express.Router();

router.post("/login", login);
router.post("/register", register);
router.post("/add_to_activity", addToActivity);

export default router;
