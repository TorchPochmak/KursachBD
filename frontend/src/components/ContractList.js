import React, { useEffect, useState } from "react";
import { fetchContracts, createContract, deleteContract, fetchContractsConcrete } from "../utils/Fetch/ContractsF";
import { useNavigate } from "react-router-dom";
import { Alert } from "./Alert";
import { useAuth } from "../contexts/AuthContext";
import '../assets/styles/ContractList.css';

const ContractsList = () => {
    const [contracts, setContracts] = useState([]);
    const [alertMessage, setAlertMessage] = useState("");
    const handleAlertClose = () => setAlertMessage("");
    const [isLoading, setIsLoading] = useState(false);
    const [newContract, setNewContract] = useState({
        marketid: null,
        marketnumber: null,
        tenantid: null,
        datecreated: null,
        dayscount: null,
    });

    const {isAuthenticated, userType, userId} = useAuth();

    useEffect(() => {
        const loadContracts = async () => {
            if(isAuthenticated)
            {
                if(userType === "admin")
                    setContracts(await fetchContracts());
                else
                    setContracts(await fetchContractsConcrete(userId));
            }
        };
        setIsLoading(true);
        loadContracts();
        setIsLoading(false);
    }, []);

    async function handleDeleteContract(contractId) {
        setIsLoading(true);
        try {
            await deleteContract(contractId);
            setContracts(contracts => contracts.filter(contract => contract.id !== contractId));
            setAlertMessage("Contract deleted successfully");
        } catch(e) {
            console.error("Error in handleDeleteContract:", e.message);
            setAlertMessage(e.message);
        }
        setIsLoading(false);
    }

    const handleChange = (e) => {
        const { name, value } = e.target;
        setNewContract((prev) => ({ ...prev, [name]: value }));
    };

    const handleCreateContract = async () => {
        try {
            setIsLoading(true);
            await createContract(newContract);         
            if(isAuthenticated)
            {
                if(userType === "admin")
                    setContracts(await fetchContracts());
                else
                    setContracts(await fetchContractsConcrete(userId));
            }
        } catch (error) {
            setAlertMessage('Failed to create contract.');
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return <p>Loading...</p>;
    }


    if(!isAuthenticated)
        return <p className="loading">You need to sign in to see this page...</p>;

    return (
        <div className="contracts-container">
            {isAuthenticated && userType === "admin" && (
            <div className="new-contract-form">
                <h2>Create New Contract</h2>
                <input type="number" name="marketid" placeholder="Market ID" value={newContract.marketid} onChange={handleChange} />
                <input type="number" name="marketnumber" placeholder="Market Number" value={newContract.marketnumber} onChange={handleChange} />
                <input type="number" name="tenantid" placeholder="Tenant ID" value={newContract.tenantid} onChange={handleChange} />
                <input type="datetime-local" name="datecreated" placeholder="Date Created" value={newContract.datecreated} onChange={handleChange} />
                <input type="number" name="dayscount" placeholder="Days Count" value={newContract.dayscount} onChange={handleChange} />
                <button className="add-contract-button" onClick={handleCreateContract}>Add Contract</button>
            </div>)}
            <div>
                <h1>Contracts</h1>
                {contracts.length === 0 ? (
                    <p>No contracts available.</p>
                ) : (
                    <div className="contracts-list">
                        {contracts.map((contract) => (
                            <div key={contract.id} className="contract-card">
                                <div className="contract-info">
                                    <p><strong>Party A (owner):</strong> {contract.ownerid}</p>
                                    <p><strong>Party B (tenant):</strong> {contract.tenantid}</p>
                                    <p><strong>Date created:</strong> {contract.datecreated}</p>
                                    <p><strong>Payed days:</strong> {contract.dayscount}</p>
                                    <p></p>
                                    <p><strong>Market ID:</strong> {contract.marketid}</p>
                                    <p><strong>Tradeplace number:</strong> {contract.marketnumber}</p>
                                    <p><strong>Price:</strong> {contract.price}</p>
                                    <p><strong>Info</strong>  {contract.info}</p>
                                </div>
                                {isAuthenticated && userType === "admin" && (
                                <button
                                    className="delete-contract-button"
                                    onClick={() => handleDeleteContract(contract.id)}
                                >
                                    Delete Contract
                                </button>)}
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

export default ContractsList;
