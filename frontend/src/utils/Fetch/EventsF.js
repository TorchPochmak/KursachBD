export const createEvent = async (event) => {
    const response = await fetch('/event/add', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(event),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to create event.');
    }

    return await response.json();
};

export const fetchEvents = async () => {
    const response = await fetch('/event/get/all', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to load events.');
    }

    const data = await response.json();
    return data.lst; // Assuming the returned data is encapsulated under a 'lst' key
};

export const deleteEvent = async (eventId) => {
    const response = await fetch(`/event/delete/${eventId}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to delete event.');
    }

    return await response.json();
};