//!done
export const fetchMarkets = async () => {
    try {
        const response = await fetch("/market/get/all", {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        });

        if (!response.ok) {
            throw new Error("Failed to fetch markets.");
        }

        const data = await response.json();
        return data.lst || [];
    } catch (error) {
        console.error("Error fetching markets:", error);
        return [];
    }
};
//!done
export const createDefaultMarket = async () => {
    try {
        const response = await fetch("/market/add", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
        });

        if (!response.ok) {
            throw new Error("Failed to create market.");
        }

        console.log("Market created successfully.");
    } catch (error) {
        console.error("Error creating market:", error);
    }
};


//!done
export const fetchMarketById = async (id) => {
    try {
        console.log("WHAT IS THAT");
        const response = await fetch(`/market/get/${id}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        });

        if (!response.ok) {
            throw new Error("Failed to fetch market.");
        }

        const data = await response.json();
        return data;  // Объект MarketInfo
    } catch (error) {
        console.error("Error fetching market:", error);
        return null;
    }
};

//!done
export const deleteMarket = async(token, marketId, setMarkets) => {
    try {
        const response = await fetch(`/market/delete/${marketId}`, {
            method: 'DELETE',
            headers: {
                Authorization: `Bearer ${token}`,
            }
        });

        if (!response.ok) {
            const errorData = await response.json();
            const errorMessage = errorData.detail || "Failed to delete market";
            throw new Error(errorMessage);
        }
    } catch (error) {
        console.error("Error in handleDeleteMarket:", error.message);
        throw new Error(error.message)
    }
}

//!done
export const updateMarket = async (token, market) => {
    const response = await fetch("/market/update", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(market),
    });

    if (!response.ok) {
        const errorData = await response.json();
        const errorMessage = errorData.detail || "Failed to update market";
        throw new Error(errorMessage);
    }
};