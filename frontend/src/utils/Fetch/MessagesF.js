
//!done
export const sendMessage = async (token, msg) => {
    const response = await fetch("/messages/add", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },   
        body: JSON.stringify(msg),
    });

    if (!response.ok) {
        const errorData = await response.json();
        const errorMessage =  JSON.stringify(errorData.detail) || "Failed to send message";
        throw new Error(errorMessage);
    }
};

export const getMessagesFrom = async (userId) => {
    try {
        const response = await fetch(`/messages/get/from/${userId}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`Failed to get messages from: ${JSON.stringify(errorData.detail)}`);
        }

        const data = await response.json();
        return data.lst;
    } catch (error) {
        throw new Error(`getMessagesFrom Error: ${error.message}`);
    }
};

export const getMessagesTo = async (userId) => {
    try {
        const response = await fetch(`/messages/get/to/${userId}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`Failed to get messages to: ${JSON.stringify(errorData.detail)}`);
        }

        const data = await response.json();
        return data.lst;
    } catch (error) {
        throw new Error(`getMessagesTo Error: ${error.message}`);
    }
};

export const checkClientExists = async (clientId) => {
    try {
        const response = await fetch("/messages/get/user", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ client_id: clientId }),
        });

        if (!response.ok) {
            if (response.status === 404) {
                return false;
            }
            return false
        }

        const data = await response.json();
        return data.exists;
    } catch (error) {
        throw new Error(`getMessagesTo Error: ${error.message}`);
}
}