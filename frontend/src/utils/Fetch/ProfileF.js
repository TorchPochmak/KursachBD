//!done
export const getProfile = async (user_id) => {
    const response = await fetch(`/profile/get/${user_id}`, {
        method: "GET"
    });

    if (!response.ok) {
        const errorData = await response.json();
        const errorMessage = errorData.detail || "Failed to get profile";
        throw new Error(errorMessage);
    }

    const data = await response.json();
    return data;
};
//!done
export const updateProfile = async (token, profile) => {
    const response = await fetch("/profile/update", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(profile),
    });

    if (!response.ok) {
        const errorData = await response.json();
        const errorMessage = errorData.detail || "Failed to get update profile";
        throw new Error(errorMessage);
    }
};
