import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchTradeplaceById, updateTradeplace, deleteTradeplace } from '../utils/Fetch/TradeplaceF';
import { Alert } from "./Alert";
import { useAuth } from "../contexts/AuthContext";

const Tradeplace = () => {
    const { marketid, id } = useParams(); // Получение ID торгового места из URL
    const [tradeplace, setTradeplace] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const loadTradeplace = async () => {
            try {
                setIsLoading(true);
                const tradeplaceData = await fetchTradeplaceById(marketid, id);
                setTradeplace(tradeplaceData);
            } catch (err) {
                setError("Failed to load tradeplace data.");
            } finally {
                setIsLoading(false);
            }
        };

        loadTradeplace();
    }, []);

    const [alertMessage, setAlertMessage] = useState("");
    const handleAlertClose = () => setAlertMessage("");

    const handleChange = (field, value) => {
        setTradeplace({ ...tradeplace, [field]: value });
    };

    const handleDelete = async () => {
        setIsLoading(true);
        setAlertMessage("");
        setError("")
        try {
            await deleteTradeplace(marketid, id);
            setAlertMessage("Tradeplace deleted successfully");
            navigate('/'); // Перенаправление на страницу списка торговых мест
        } catch (error) {
            setError("Failed to delete tradeplace: " + error.message);
        }
        setIsLoading(false);
    };

    const handleSubmit = async (e) => {
        setIsLoading(true);
        setAlertMessage("");
        setError("")
        try {
            await updateTradeplace(marketid, id, tradeplace);
            setAlertMessage("Tradeplace updated successfully");
        } catch (error) {
            setError("Failed to update tradeplace: " + error.message);
        }
        setIsLoading(false);
    };

    if (isLoading) {
        return <p>Loading...</p>;
    }

    if (!tradeplace) {
        return <p>Tradeplace not found!</p>;
    }
    const {isAuthenticated, userType, userId} = useAuth();
    if(!isAuthenticated)
        return <p className="loading">You need to sign in to see this page...</p>;

    return (
        <div>
            <h1>Edit Tradeplace</h1>
            {alertMessage && <Alert message={alertMessage} onClose={handleAlertClose} />}
            {error && <p className="error">{error}</p>}
    
            <form onSubmit={handleSubmit}>
                <div>
                    <label>Market ID:</label>
                    <input
                        type="text"
                        value={tradeplace.marketid}
                        onChange={(e) => handleChange("marketid", e.target.value)}
                        disabled={!isAuthenticated || userType !== "admin"}
                    />
                </div>
    
                <div>
                    <label>Market Number:</label>
                    <input
                        type="text"
                        value={tradeplace.marketnumber}
                        onChange={(e) => handleChange("marketnumber", e.target.value)}
                        disabled={!isAuthenticated || userType !== "admin"}
                    />
                </div>
    
                <div>
                    <label>Price:</label>
                    <input
                        type="text"
                        value={tradeplace.price}
                        onChange={(e) => handleChange("price", e.target.value)}
                        disabled={!isAuthenticated || userType !== "admin"}
                    />
                </div>
                <div>
                    <label>Info:</label>
                    <input
                        type="text"
                        value={tradeplace.info}
                        onChange={(e) => handleChange("info", e.target.value)}
                        disabled={!isAuthenticated || userType !== "admin"}
                    />
                </div>
                <div>
                    <label>Owner ID:</label>
                    <input
                        type="text"
                        value={tradeplace.ownerid}
                        onChange={(e) => handleChange("ownerid", e.target.value)}
                        disabled={!isAuthenticated || userType !== "admin"}
                    />
                </div>
                {(isAuthenticated && userType === "admin") &&
                <button 
                    type="submit" 
                    onClick={handleSubmit} 
                    disabled={!isAuthenticated || userType !== "admin"}
                >
                    Save Changes
                </button>
                }
                {(isAuthenticated && userType === "admin") &&
                <button 
                    type="button" 
                    onClick={handleDelete} 
                    disabled={isLoading || !isAuthenticated || userType !== "admin"}
                >
                    Delete Tradeplace
                </button>}
            </form>
        </div>
    );
};

export default Tradeplace;