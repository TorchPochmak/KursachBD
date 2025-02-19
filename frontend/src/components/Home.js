import React from "react";
import "../assets/styles/Home.css";
import { FaSignInAlt, FaGamepad } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { CiStar } from "react-icons/ci";
import { useAuth } from "../contexts/AuthContext";

const LoginButton = () => {
    const navigate = useNavigate();
    const token = localStorage.getItem("authToken");
    if (!token) {
        return (
            <button
                onClick={() => navigate("/login")}
                className="banner-button"
            >
                <FaSignInAlt /> Login
            </button>
        );
    }
};

const Home = () => {
    const navigate = useNavigate();
    return (
        <div className="banner">
            <div className="banner-content">
                <h1>Welcome to RuMarketHub</h1>
                <p>You can check our markets here!</p>
                <p>Make contracts with owners of tradeplaces!</p>
                <p>Mail them directly!</p>
                <p>Make events! Promote your tradeplace or market!</p>
                <p>If you need a help, mail our Administrator (id=1)</p>
                <div className="banner-buttons">
                    <button
                        onClick={() => navigate("/markets")}
                        className="banner-button"
                    >
                        <CiStar /> Let's make your first contract!
                    </button>
                    <LoginButton />
                </div>
            </div>
        </div>
    );
};

export default Home;
