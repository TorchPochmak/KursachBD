export const fetchContracts = async () => {
    try {
        const response = await fetch("/contract/get/all", {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        });

        if (!response.ok) {
            throw new Error("Failed to fetch contracts.");
        }

        const data = await response.json();
        return data.lst || [];
    } catch (error) {
        console.error("Error fetching contracts:", error);
        return [];
    }
};
export const fetchContractsConcrete = async (id) => {
    try {
        const response = await fetch(`/contract/get/${id}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        });

        if (!response.ok) {
            throw new Error("Failed to fetch contracts.");
        }

        const data = await response.json();
        return data.lst || [];
    } catch (error) {
        console.error("Error fetching contracts:", error);
        return [];
    }
};

export const deleteContract = async (contractId) => {
    try {
        const response = await fetch(`/contract/delete/${contractId}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
            },
        });

        if (!response.ok) {
            if (response.status === 404) {
                throw new Error("Contract not found.");
            }
            throw new Error("Failed to delete contract.");
        }

        const data = await response.json();
        console.log(data.detail);
        return data.detail;
    } catch (error) {
        console.error("Error deleting contract:", error);
        throw error;
    }
};
export const createContract = async (contract) => {
    try {
        const response = await fetch("/contract/add", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(contract),
        });

        if (!response.ok) {
            throw new Error("Failed to create contract.");
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error creating contract:", error);
        throw error;
    }
};