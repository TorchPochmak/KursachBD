import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { fetchMarketById, updateMarket } from '../utils/Fetch/MarketF'
import { useNavigate } from "react-router-dom";
import { Alert } from "../components/Alert";
import { useAuth } from "../contexts/AuthContext";

const Market = () => {
    const { id } = useParams(); //Прокидывается ID рынка
    const [market, setMarket] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [tradeplace, setTradeplace] = useState(null);

    const navigate = useNavigate();
    useEffect(() => {
        const loadMarket = async () => {
            console.log("market id: ", id);
            const marketData = await fetchMarketById(id);
            setMarket(marketData);
            setIsLoading(false);
        };

        loadMarket();
    }, []);
    const [alertMessage, setAlertMessage] = useState("");
    const handleAlertClose = () => setAlertMessage("");

    const handleChange = (field, value) => {
        setMarket({ ...market, [field]: value });
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                // Закодировать файл в base64
                const imageBase64 = reader.result.split(",")[1]; // Убираем префикс "data:image/*;base64,"
                console.log("ИДИ НАУХЙ")
                setMarket((prevMarket) => ({
                    ...prevMarket,
                    schemepng: imageBase64,
                }));
            };
            reader.onerror = () => setError("Error reading file.");
            reader.readAsDataURL(file); // Преобразуем файл в ArrayBuffer
        }
    };

    const fileInputRef = useRef(null);

    const handleButtonClick = () => {
        fileInputRef.current.click();
    };

    const handleMarketClick = (parseid) => {    
        navigate(`/tradeplace/${id}/${parseid}`); // Перенаправление на маршрут рынка
    };

    const {isAuthenticated, userType, userId} = useAuth();
    if(!isAuthenticated)
        return <p className="loading">You need to sign in to see this page...</p>;

    const handleTradePlace = async () => {
        setIsLoading(true);
        try {
            const marketData = await fetchMarketById(id);
            const parsedCount = parseInt(tradeplace, 10); 

            if (isNaN(parsedCount) || parsedCount <= 0 ) {
                setError("Error: count of tradeplaces must be a positive");
                setIsLoading(false);
                return;
            }
            if (marketData.placescount >= parsedCount) {
                handleMarketClick(parsedCount);
            } else {
                setError("Selected trade place exceeds available places in the market.");
            }
        } catch (error) {
            setError("Failed to fetch market data: " + error.message);
        }
        setIsLoading(false);
    }
    
    const handleSubmit = async (e) => {
        setIsLoading(true);
        const token = localStorage.getItem("authToken");
        const parsedCount = parseInt(market.placescount, 10);
        // Проверяем, что число находится в допустимом диапазоне
        if (isNaN(parsedCount) || parsedCount <= 0 || parsedCount > 10000) {
            setError("Error: count of tradeplaces must be a positive less than 10000");
            setIsLoading(false);
            return;
        }
        try
        {
            console.log(market)
            await updateMarket(token, market);
        } catch (error) {
            setError(error.message);
            setIsLoading(false);
            return;
        }
        setAlertMessage("Market has been changed successfully")

        console.log("Submitting changes:", market);
        setError("");
        setIsLoading(false);
    };

    if (isLoading) {
        return <p>Loading...</p>;
    }

    if (!market) {
        return <p>Market not found!</p>;
    }
    return (
        <div>
            {isAuthenticated && userType === "admin" ? (
                <h1>Edit Market</h1>
            ) : (
                <h1>View Market</h1>
            )}
    
            <div>
                <div>
                    <label>ID:</label>
                    <p>{market.id}</p>
                </div>
                <div>
                    <label>Address:</label>
                    <input
                        type="text"
                        value={market.address || ''}
                        onChange={(e) => handleChange('address', e.target.value)}
                        disabled={!isAuthenticated || userType !== "admin"}
                    />
                </div>
                <div>
                    <label>Name:</label>
                    <input
                        type="text"
                        value={market.name || ''}
                        onChange={(e) => handleChange('name', e.target.value)}
                        disabled={!isAuthenticated || userType !== "admin"}
                    />
                </div>
                <div>
                    <label>Opened:</label>
                    <input
                        type="checkbox"
                        checked={market.isopened || false}
                        onChange={(e) => handleChange('isopened', e.target.checked)}
                        disabled={!isAuthenticated || userType !== "admin"}
                    />
                </div>
                <div>
                    <label>Places Count:</label>
                    <input
                        type="text"
                        value={market.placescount}
                        onChange={(e) => handleChange('placescount', e.target.value)}
                        disabled={!isAuthenticated || userType !== "admin"}
                    />
                </div>
                <div>
                    <label>Owner ID:</label>
                    <input
                        type="text"
                        value={market.ownerid}
                        onChange={(e) => handleChange('ownerid', e.target.value)}
                        disabled={!isAuthenticated || userType !== "admin"}
                    />
                </div>
                <div>
                    <input
                        type="file"
                        id="file"
                        className="file-input"
                        accept="image/*"
                        onChange={handleImageChange}
                        ref={fileInputRef}
                        style={{ display: 'none' }}
                        disabled={!isAuthenticated || userType !== "admin"}
                    />
                    {(isAuthenticated && userType === "admin") &&
                    <button onClick={handleButtonClick} className="file-label" disabled={!isAuthenticated || userType !== "admin"}>
                        {market.schemepng ? "Change photo" : "Choose a photo"}
                    </button>}
                </div>
                {market.schemepng && <p className="file-name">File selected</p>}
                {market.schemepng && 
                    <img src={`data:image/png;base64,${market.schemepng}`}
                    alt="scheme"
                    style={{
                    maxWidth: '300px',
                    maxHeight: '300px',
                    width: 'auto',
                    height: 'auto'
                    }} />
                }
                <div>
                    {(isAuthenticated && userType === "admin") &&
                    <button onClick={handleSubmit} disabled={!isAuthenticated || userType !== "admin"}>
                        Save Changes
                    </button>
                    }
                </div>
                <div>
                    <label>Tradeplace number:</label>
                    <input
                        type="text"
                        value={tradeplace}
                        onChange={(e) => setTradeplace(e.target.value)}
                    />
                    <button 
                        onClick={handleTradePlace} 
                    >
                        {isAuthenticated && userType === "admin" ? "Edit Info" : "View Info"}
                    </button>
                </div>
                {error && <p className="error">{error}</p>}
                {alertMessage !== "" && (
                    <Alert message={alertMessage} onClose={handleAlertClose} />
                )}
            </div>
        </div>
    );
};

export default Market;