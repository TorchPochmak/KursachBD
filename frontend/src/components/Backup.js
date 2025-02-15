import React, { useEffect, useState } from "react";
import { getBackups, postBackup } from "../utils/Fetch/BackupsF";
import { useAuth } from "../contexts/AuthContext";

const Backup = () => {
    const [backUps, setBackUps] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const { isAuthenticated, logout, userType } = useAuth();
    useEffect(() => {
        const fetchBackUps = async () => {
            try {
                const token = localStorage.getItem("authToken");
                const data = await getBackups(token);
                setBackUps(data);
            } catch (error) {
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };
        fetchBackUps();
    }, []);

    const handleClick = async (filename) => {
        try {
            const token = localStorage.getItem("authToken");
            await postBackup(token, filename);
        } catch (err) {
            setError(err.message);
        }
    };

    if (error) {
        return <p className="error">{error}</p>;
    }

    if (loading) {
        return <p className="loading">Loading...</p>;
    }
    

    return (
        <div>
            {isAuthenticated && userType === "admin" && (
            <div className="back-page">
                {backUps.backup_names_list.map((backUp) => {
                    return (
                        <button onClick={() => handleClick(backUp)}>
                            {backUp}
                        </button>
                    );
                })}

                {backUps.length === 0 && (
                    <p className="no-backup">No backups available</p>
                )}
            </div>)}
            {(!isAuthenticated || userType !== "admin") && (
            <div className="back-page">
                <p className="loading">You have no rights to see this page...</p>;
            </div>)}
        </div>
    );
};

export default Backup;
