import React, { useEffect, useState } from "react";
import { createDefaultMarket, deleteMarket, fetchMarkets } from "../utils/Fetch/MarketF.js";
import '../assets/styles/MarketList.css';
import { useNavigate } from "react-router-dom";
import { Alert } from "./Alert.js";
import { useAuth } from "../contexts/AuthContext.js";

const MarketList = () => {
    const [markets, setMarkets] = useState([]);
    const navigate = useNavigate();
    const [alertMessage, setAlertMessage] = useState("");
    const handleAlertClose = () => setAlertMessage("");
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const loadMarkets = async () => {
            const data = await fetchMarkets();
            setMarkets(data);
        };
        setIsLoading(true);
        loadMarkets();
        setIsLoading(false);
    }, []);

    async function handleDeleteMarket(marketId) {
        setIsLoading(true);
        const token = localStorage.getItem("authToken"); 
        try {
            await deleteMarket(token, marketId, setMarkets);
            setMarkets(markets.filter(market => market.id !== marketId));
        } catch(e) {
            console.error("Error in handleDeleteMarket:", e.message);
            setAlertMessage(e.message);
        }
        setIsLoading(false);
    }

    const handleCreateMarket = async () => {
        await createDefaultMarket();
        // Можно добавить перезагрузку списка рынков здесь, если это необходимо
        const loadMarkets = async () => {
            const data = await fetchMarkets();
            setMarkets(data);
        };
        setIsLoading(true);
        loadMarkets();
        setIsLoading(false);
    };

    if (isLoading) {
        return <p>Loading...</p>;
    }

    const handleMarketClick = (marketId) => {    
        navigate(`/market/${marketId}`); // Перенаправление на маршрут рынка
    };

    const {isAuthenticated, userType, userId} = useAuth();
    if(!isAuthenticated)
        return <p className="loading">You need to sign in to see this page...</p>;

    return (
        <div className="market-container">
            {(isAuthenticated && userType === "admin") &&
            <button 
                className="add-market-button" 
                onClick={handleCreateMarket} 
                disabled={!isAuthenticated || userType !== "admin"}
            >
                Add Default Market
            </button>}
            <div>
                <h1>Markets</h1>
                {markets.length === 0 ? (
                    <p>No markets available.</p>
                ) : (
                    <div className="market-list">
                        {markets.map((market) => (
                            <div key={market.id} className="market-card">
                                <h2>
                                    <button 
                                        className="market-id-button" 
                                        onClick={() => handleMarketClick(market.id)}
                                    >
                                        {market.name}
                                    </button>
                                </h2>
                                <div className="market-info">
                                    <img
                                        src={`data:image/png;base64,${market.schemepng}`}
                                        alt="No market scheme"
                                        className="market-image"
                                    />
                                    <p><strong>Address:</strong> {market.address}</p>
                                    <p><strong>Opened:</strong> {market.isopened ? "Yes" : "No"}</p>
                                    <p><strong>Places Count:</strong> {market.placescount}</p>
                                    <p><strong>ID:</strong> {market.id}</p>
                                    <p><strong>Owner ID:</strong> {market.ownerid}</p>
                                </div>
                                {(isAuthenticated && userType === "admin") &&
                                <button
                                    className="delete-market-button"
                                    onClick={() => handleDeleteMarket(market.id)}
                                    disabled={!isAuthenticated || userType !== "admin"}
                                >
                                    Delete Market
                                </button>}
                            </div>
                        ))}
                    </div>
                )}
            </div>
            {alertMessage !== "" && (
                <Alert message={alertMessage} onClose={handleAlertClose} />
            )}
        </div>
    );
};

export default MarketList;