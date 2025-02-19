import React, { useEffect, useState } from "react";
import { getProfile, updateProfile } from "../utils/Fetch/ProfileF";
import { FaEdit } from "react-icons/fa";
import { Alert } from "./Alert";
import "../assets/styles/Profile.css";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const Profile = () => {
    const [profile, setProfile] = useState({
        client_id: null,
        client_username: null,
        client_email: null,
        client_is_admin: null,
        client_phone_number: null,
        person_id: null,
        person_organization: null,
        person_first_name: null,
        person_last_name: null,
        person_patronymic: null,
        person_citizenship: null,
        person_description: null
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [editing, setEditing] = useState({
        client_username: false,
        client_phone_number: false,
        person_organization: false,
        person_first_name: false,
        person_last_name: false,
        person_patronymic: false,
        person_citizenship: false,
        person_description: false,
    });
    const [alertMessage, setAlertMessage] = useState("");
    const [curUser, setCurUser] = useState(null);
    const navigate = useNavigate();
    const handleAlertClose = () => setAlertMessage("");

    useEffect(() => {
        const token = localStorage.getItem("authToken");
        if (!token) {
            navigate("/");
        }
        const userId = localStorage.getItem("userId");
        setCurUser(userId);
        const fetchData = async () => {
            setLoading(true);
            try {
                const data = await getProfile(userId);
                setProfile(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const handleEdit = (field) => {
        setEditing((prev) => ({ ...prev, [field]: true }));
    };

    const closeEdit = (field) => {
        setEditing((prev) => ({ ...prev, [field]: false }));
    };

    const handleChange = (field, value) => {
        setProfile((prev) => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async () => {
        setLoading(true);
        const token = localStorage.getItem("authToken");
        try {
            console.log(profile.client_is_admin);
            await updateProfile(token, profile);
            setAlertMessage("Profile updated successfully");
        } catch (err) {
            setError("Error updating profile: " + err.message);
        } finally {
            setLoading(false);
        }
        closeEdit("client_username");
        closeEdit("client_phone_number");
        closeEdit("person_organization");
        closeEdit("person_first_name");
        closeEdit("person_last_name");
        closeEdit("person_patronymic");
        closeEdit("person_citizenship");
        closeEdit("person_description");
    };

    if (loading) {
        return <p className="loading">Loading...</p>;
    }

    if (error) {
        return <p className="error">{error}</p>;
    }
    const {isAuthenticated, userId} = useAuth();
    if(!isAuthenticated)
        return <p className="loading">You need to sign in to see this page...</p>;
    
    return (
        <div>
            <h2>Your Profile</h2>  
            <div className="profile-container">
                <div className="profile-field">
                        <label>User Id</label>
                        <div className="field-container">
                            {profile.client_id}
                            <FaEdit />
                        </div>
                </div>

                <div className="profile-field">
                    <label>Username</label>
                    <div className="field-container">
                        {editing.client_username ? (
                            <input
                                type="text"
                                value={profile.client_username || ""}
                                onChange={(e) =>
                                    handleChange("client_username", e.target.value)
                                }
                            />
                        ) : (
                            <span>
                                {profile.client_username || "No name provided"}
                            </span>
                        )}
                        <button
                            className="edit-button"
                            onClick={() => handleEdit("client_username")}
                        >
                            <FaEdit />
                        </button>
                    </div>
                </div>
                
                <div className="profile-field">
                    <label>Email</label>
                    <div className="field-container">
                        {profile.client_email}
                        <FaEdit />
                    </div>
                </div>
                
                
                <div className="profile-field">
                    <label>Is Administrator</label>
                    <div className="field-container">
                        {profile.client_is_admin ? "Yes" : "No"}
                        <FaEdit />
                    </div>
                </div>
                

                <div className="profile-field">
                    <label>Phone number</label>
                    <div className="field-container">
                        {editing.client_phone_number ? (
                            <input
                                type="text"
                                value={profile.client_phone_number || ""}
                                onChange={(e) =>
                                    handleChange("client_phone_number", e.target.value)
                                }
                            />
                        ) : (
                            <span>
                                {profile.client_phone_number || "Nothing provided"}
                            </span>
                        )}
                        <button
                            className="edit-button"
                            onClick={() => handleEdit("client_phone_number")}
                        >
                            <FaEdit />
                        </button>
                    </div>
                </div>

                <div className="profile-field">
                    <label>Person ID</label>
                    <div className="field-container">
                        {profile.person_id}
                        <FaEdit />
                    </div>
                </div>

                <div className="profile-field">
                    <label>Organization</label>
                    <div className="field-container">
                        {editing.person_organization ? (
                            <input
                                value={profile.person_organization || ""}
                                onChange={(e) =>
                                    handleChange("person_organization", e.target.value)
                                }
                            />
                        ) : (
                            <span>
                                {profile.person_organization || "No organization provided"}
                            </span>
                        )}
                        <button
                            className="edit-button"
                            onClick={() => handleEdit("person_organization")}
                        >
                            <FaEdit />
                        </button>
                    </div>
                </div>

                <div className="profile-field">
                    <label>Firstname</label>
                    <div className="field-container">
                        {editing.person_first_name ? (
                            <input
                                value={profile.person_first_name || ""}
                                onChange={(e) =>
                                    handleChange("person_first_name", e.target.value)
                                }
                            />
                        ) : (
                            <span>
                                {profile.person_first_name || "No Firstname provided"}
                            </span>
                        )}
                        <button
                            className="edit-button"
                            onClick={() => handleEdit("person_first_name")}
                        >
                            <FaEdit />
                        </button>
                    </div>
                </div>

                <div className="profile-field">
                    <label>Lastname</label>
                    <div className="field-container">
                        {editing.person_last_name ? (
                            <input
                                value={profile.person_last_name || ""}
                                onChange={(e) =>
                                    handleChange("person_last_name", e.target.value)
                                }
                            />
                        ) : (
                            <span>
                                {profile.person_last_name || "No lastname provided"}
                            </span>
                        )}
                        <button
                            className="edit-button"
                            onClick={() => handleEdit("person_last_name")}
                        >
                            <FaEdit />
                        </button>
                    </div>
                </div>

                <div className="profile-field">
                    <label>Patronymic</label>
                    <div className="field-container">
                        {editing.person_patronymic ? (
                            <input
                                value={profile.person_patronymic || ""}
                                onChange={(e) =>
                                    handleChange("person_patronymic", e.target.value)
                                }
                            />
                        ) : (
                            <span>
                                {profile.person_patronymic || "No patronymic provided"}
                            </span>
                        )}
                        <button
                            className="edit-button"
                            onClick={() => handleEdit("person_patronymic")}
                        >
                            <FaEdit />
                        </button>
                    </div>
                </div>

                <div className="profile-field">
                    <label>Citizenship</label>
                    <div className="field-container">
                        {editing.person_citizenship ? (
                            <input
                                value={profile.person_citizenship || ""}
                                onChange={(e) =>
                                    handleChange("person_citizenship", e.target.value)
                                }
                            />
                        ) : (
                            <span>
                                {profile.person_citizenship || "No citizenship provided"}
                            </span>
                        )}
                        <button
                            className="edit-button"
                            onClick={() => handleEdit("person_citizenship")}
                        >
                            <FaEdit />
                        </button>
                    </div>
                </div>

                <div className="profile-field">
                    <label>Description</label>
                    <div className="field-container">
                        {editing.person_description ? (
                            <input
                                value={profile.person_description || ""}
                                onChange={(e) =>
                                    handleChange("person_description", e.target.value)
                                }
                            />
                        ) : (
                            <span>
                                {profile.person_description || "No description provided"}
                            </span>
                        )}
                        <button
                            className="edit-button"
                            onClick={() => handleEdit("person_description")}
                        >
                            <FaEdit />
                        </button>
                    </div>
                </div>

                <div className="submit-container">
                    <button onClick={handleSubmit}>Submit</button>
                </div>

                {alertMessage !== "" && (
                    <Alert message={alertMessage} onClose={handleAlertClose} />
                )}
            </div>
        </div>
    );
};

export default Profile;
