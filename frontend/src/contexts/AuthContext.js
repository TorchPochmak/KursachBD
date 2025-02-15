import React, { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [userType, setUserType] = useState(null);
    const [userId, setUserId] = useState(null);
    const navigate = useNavigate();
    const [wasLogout, setWasLogout] = useState(false);

    const login = (token, type, id) => {
        localStorage.setItem("authToken", token);
        localStorage.setItem("userType", type);
        localStorage.setItem("userId", id);
        setUserType(type);
        setUserId(id);
        setIsAuthenticated(true);
    };

    const logout = () => {
        localStorage.removeItem("authToken");
        localStorage.removeItem("userType");
        localStorage.removeItem("userId");
        setUserType(null);
        setUserId(null);
        setIsAuthenticated(false);
        setWasLogout(true);
    };

    useEffect(() => {
        const token = localStorage.getItem("authToken");
        const savedUserType = localStorage.getItem("userType");
        const savedUserId = localStorage.getItem("userId");
        setIsAuthenticated(token !== null);
        setUserType(savedUserType);
        setUserId(savedUserId);
    }, []);

    useEffect(() => {
        if (wasLogout) {
            console.log("Navigating to home...");
            navigate("/");
            setWasLogout(false);
        }
    }, [wasLogout, navigate]);

    return (
        <AuthContext.Provider
            value={{ isAuthenticated, userType, userId, login, logout }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
