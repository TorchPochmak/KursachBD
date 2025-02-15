//!done
export const backup = async (token) => {
    const response = await fetch(`/backup/add`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        const errorData = await response.json();
        const errorMessage = errorData.detail || "Failed to backup";
        throw new Error(errorMessage);
    }
};
//!done
export const postBackup = async (token, filename) => {
    const response = await fetch(`/restore`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ filename }),
    });

    if (!response.ok) {
        const errorData = await response.json();
        const errorMessage = errorData.detail || "Failed to backup";
        throw new Error(errorMessage);
    }
};
//!done
export const getBackups = async (token) => {
    const response = await fetch(`/backup/get/all`, {
        method: "GET",
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        const errorData = await response.json();
        const errorMessage = errorData.detail || "Failed to get backups";
        throw new Error(errorMessage);
    }

    const data = await response.json();
    return data;
};
