import React, { useState } from "react";
import { getProfile } from "../utils/Fetch/ProfileF"; 
import { Alert } from "./Alert"; 
import '../assets/styles/Search.css'; 

const Search = () => {
    const [personId, setPersonId] = useState("");
    const [personData, setPersonData] = useState(null);
    const [error, setError] = useState("");

    const handleSearch = async () => {
        if (!personId.trim() || isNaN(personId)) {
            setError("Please enter a valid numeric ID.");
            setPersonData(null);
            return;
        }

        try {    
            const data = await getProfile(personId); 
            if (data.person_id === parseInt(personId)) {  
                setPersonData(data);
                setError("");
            } else {
                setPersonData(null);
                setError(`Person with id: ${personId} not found.`); 
            }
        } catch (err) {
            setError(`Error while searching: ${err.message}`); 
        }
    };

    return (
        <div className="search-container">
            <h2>Search for a Person by ID:</h2>
            <label>Enter a user ID:</label>
            <input
                type="text"
                value={personId}
                onChange={(e) => setPersonId(e.target.value)}
            />
            <button onClick={handleSearch}>Search</button>
            
            {error && <Alert message={error} onClose={() => setError("")} />}

            {personData ? (
                <div className="person-data">
                    <p>ID: {personData.person_id}</p>
                    <p>Firstname: {personData.person_first_name}</p>
                    <p>Lastname: {personData.person_last_name}</p>
                    <p>Patronymic: {personData.person_patronymic}</p>
                    <p>Citizenship: {personData.person_citizenship}</p>
                    <p>Description: {personData.person_description}</p>
                    <p>Organization: {personData.person_organization}</p>
                </div>
            ) : (
                !error
            )}
        </div>
    );
};

export default Search;