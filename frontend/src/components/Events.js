import React, { useEffect, useState } from "react";
import { fetchEvents, createEvent, deleteEvent } from "../utils/Fetch/EventsF";
import { Alert } from "../components/Alert";
import { useAuth } from "../contexts/AuthContext";
import '../assets/styles/Events.css';

const Events = () => {
    const [events, setEvents] = useState([]);
    const [alertMessage, setAlertMessage] = useState("");
    const handleAlertClose = () => setAlertMessage("");
    const [isLoading, setIsLoading] = useState(false);
    const [newEvent, setNewEvent] = useState({
        EventId: 0, //не используется
        EventName: "",
        Description: "",
        StartDate: "",
        EndDate: "",
        OwnerId: 0,
    });

    useEffect(() => {
        const loadEvents = async () => {
            try {
                setIsLoading(true);
                const eventsData = await fetchEvents();
                setEvents(eventsData);
            } catch (error) {
                setAlertMessage(error.message);
            } finally {
                setIsLoading(false);
            }
        };
        loadEvents();
    }, []);

    const handleEventChange = (e) => {
        const { name, value } = e.target;
        setNewEvent((prev) => ({ ...prev, [name]: value }));
    };

    const validateEvent = () => {
        if (!newEvent.EventName) return "Event Name is required.";
        if (!newEvent.Description) return "Description is required.";
        if (!newEvent.StartDate) return "Start Date is required.";
        if (!newEvent.EndDate) return "End Date is required";
        if (!newEvent.OwnerId) return "Owner ID is required.";
        const startDate = new Date(newEvent.StartDate);
        const endDate = new Date(newEvent.EndDate);
    
        if (startDate > endDate) return "Start Date must be before or equal to End Date.";
        const parsedId = parseInt(newEvent.OwnerId, 10); 

        if (isNaN(parsedId) || parsedId <= 0 ) {
            return "Error: Owner id must be a positive";
        }
        return null;
    };

    const handleCreateEvent = async () => {
        const validationError = validateEvent();
        if (validationError) {
            setAlertMessage(validationError);
            return;
        }
        
        try {
            setIsLoading(true);
            await createEvent(newEvent);
            const eventsData = await fetchEvents();
            setEvents(eventsData);
            setAlertMessage("Event created successfully.");
            setNewEvent({
                EventId: 0,
                EventName: "",
                Description: "",
                StartDate: "",
                EndDate: "",
                OwnerId: 0,
            });
        } catch (error) {
            setAlertMessage(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteEvent = async (eventId) => {
        try {
            setIsLoading(true);
            await deleteEvent(eventId);
            const eventsData = await fetchEvents();
            setEvents(eventsData);
            setAlertMessage("Event deleted successfully.");
        } catch (error) {
            setAlertMessage(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return <p>Loading...</p>;
    }
    const {isAuthenticated, userType, userId} = useAuth();  

    return (
        
        <div className="events-manager">
        {isAuthenticated && userType === "admin" && (   
            <div className="new-event-form">
                <h2>Create New Event</h2>
                <input type="text" name="OwnerId" placeholder="Owner ID" value={newEvent.OwnerId} onChange={handleEventChange} />
                <input type="text" name="EventName" placeholder="Event Name" value={newEvent.EventName} onChange={handleEventChange} />
                <input type="text" name="Description" placeholder="Description" value={newEvent.Description} onChange={handleEventChange} />
                <input type="datetime-local" name="StartDate" value={newEvent.StartDate} onChange={handleEventChange} />
                <input type="datetime-local" name="EndDate" value={newEvent.EndDate} onChange={handleEventChange} />
                <button onClick={handleCreateEvent}>Add Event</button>
            </div>)}
            <div>
                <h1>Events</h1>
                {events.length === 0 ? (
                    <p>No events available.</p>
                ) : (
                    <ul>
                        {events.map((event) => (
                            <li key={event.EventId}>
                                <p><strong>Name:</strong> {event.EventName}</p>
                                <p><strong>Created by:</strong> {event.OwnerId}</p>
                                <p><strong>Description:</strong> {event.Description}</p>
                                <p><strong>Start Date:</strong> {event.StartDate}</p>
                                <p><strong>End Date:</strong> {event.EndDate}</p>
                                {isAuthenticated && userType === "admin" && (
                                    <button onClick={() => handleDeleteEvent(event.EventId)}>Delete Event</button>
                                )}
                            </li>
                        ))}
                    </ul>
                )}
            </div>
            {alertMessage && <Alert message={alertMessage} onClose={handleAlertClose} />}
        </div>
    );
};

export default Events;