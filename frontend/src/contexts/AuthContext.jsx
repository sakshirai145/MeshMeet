import axios from "axios";
import httpStatus from "http-status";
import { createContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import server from "../environment";

export const AuthContext = createContext({});

const client = axios.create({
  baseURL: `${server}/api/v1/users`,
});

// Automatically attach token to every request
client.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const AuthProvider = ({ children }) => {
  const [userData, setUserData] = useState(null);
  const router = useNavigate();

  // ---------------- REGISTER ----------------
  const handleRegister = async (name, username, password) => {
    try {
      const request = await client.post("/register", {
        name,
        username,
        password,
      });

      if (request.status === httpStatus.CREATED) {
        return request.data.message;
      }
    } catch (err) {
      throw err;
    }
  };

  // ---------------- LOGIN ----------------
  const handleLogin = async (username, password) => {
    try {
      const request = await client.post("/login", {
        username,
        password,
      });

      if (request.status === httpStatus.OK) {
        const token = request.data.token;

        localStorage.setItem("token", token);
        setUserData({ username });

        router("/home");
      }
    } catch (err) {
      throw err;
    }
  };

  // ---------------- GET HISTORY ----------------
  const getHistoryOfUser = async () => {
    try {
      const request = await client.get("/get_all_activity");
      return request.data;
    } catch (err) {
      throw err;
    }
  };

  // ---------------- ADD ACTIVITY ----------------
  const addToUserHistory = async (meetingCode) => {
    try {
      const request = await client.post("/add_to_activity", {
        meeting_code: meetingCode,
      });

      return request.data;
    } catch (err) {
      throw err;
    }
  };

  const data = {
    userData,
    setUserData,
    handleRegister,
    handleLogin,
    getHistoryOfUser,
    addToUserHistory,
  };

  return (
    <AuthContext.Provider value={data}>
      {children}
    </AuthContext.Provider>
  );
};
