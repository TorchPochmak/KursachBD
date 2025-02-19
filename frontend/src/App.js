import React from "react";
import Login from "./components/Login/Login.js";
import Register from "./components/Register/Register.js";
import { AuthProvider } from "./contexts/AuthContext";
import "./assets/styles/App.css";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Home from "./components/Home.js";
import { getNavigateMenu } from "./components/Navigator.js";
import Profile from "./components/Profile.js";
import Backup from "./components/Backup";
import Market from "./components/Market.js"
import MessageForm from "./components/MessageForm.js";
import MarketList from "./components/MarketList.js";
import Tradeplace from "./components/Tradeplace.js";
import ContractsList from "./components/ContractList.js";
import Events from "./components/Events.js";
import Search from "./components/Search.js";

const App = () => {
    return (
        <div className="app-container">
            {getNavigateMenu()}
            <div className="main-content">
                <Routes>              
                    <Route path="/" element={<Home />} />
                    <Route path="/backups" element={<Backup />} />
                    <Route path="/markets" element={<MarketList />} />
                    <Route path="/market/:id" element={<Market/>}/>
                    <Route path="/tradeplace/:marketid/:id" element={<Tradeplace/>} />
                    <Route path="/contracts" element={<ContractsList />} />

                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />

                    <Route path="/profile" element={<Profile />} />
                    <Route path="/mail" element={<MessageForm />} />

                    <Route path="/events" element={<Events/>}/>
                    <Route path="/search" element={<Search/>}/>
                </Routes>
            </div>
        </div>
    );
};

const AppWrapper = () => (
    <Router>
        <AuthProvider>
            <App />
        </AuthProvider>
    </Router>
);

export default AppWrapper;
