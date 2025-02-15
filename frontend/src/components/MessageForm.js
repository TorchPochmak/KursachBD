import React, { useEffect, useState } from "react";
import { sendMessage, getMessagesFrom, getMessagesTo, checkClientExists } from "../utils/Fetch/MessagesF";
import { Alert } from "../components/Alert";
import { isPositiveNumber } from "../utils/Parse";
import { useAuth } from "../contexts/AuthContext";
import "../assets/styles/MessageForm.css"

const MessageForm = () => {
    const [fromList, setFromList] = useState([]);
    const [toList, setToList] = useState([]);
    const [alertMessage, setAlertMessage ] = useState("");
    const [loading, setLoading ] = useState(true);
    const [message, setMessage] = useState({
        fromId: "",
        toId: "",
        theme: "",
        subject: "", 
    });

    const [outmsg, setOutmsg] = useState({
        fromId: 0,
        toId: 0,
        theme: "",
        subject: "", 
    });
    
    const {isAuthenticated, userId} = useAuth();
    if(!isAuthenticated)
        return <p className="loading">You need to sign in to see this page...</p>;
    
    const handleAlertClose = () => setAlertMessage("");
    
    useEffect(() => {
        setLoading(true);

        const token = localStorage.getItem("authToken");
        if (!token) {
            navigate("/");
            return;
        }
        getMessages();
        setLoading(false);
    }, []);

    const getMessages = async () => {
        try {
            if (isAuthenticated) {
                const fromList = await getMessagesFrom(userId);
                const toList = await getMessagesTo(userId);
    
                // Обновляем список сообщений
                setFromList(fromList);
                setToList(toList);
            }
        } catch (error) {
            setAlertMessage(error.message);
        }
    };
    //Изменение текущего состояния message
    const handleInternalChange = (field, value) => {
        setMessage((prev) => ({ ...prev, 
            [field]: value 
        }));
    };

    const handleOutChange = (field, value) => {
        setOutmsg((prev) => ({ ...prev, 
            [field]: value 
        }));
    };
    //Submit кнопка
    const handleSubmit = async () => {   
        setLoading(true);
        const token = localStorage.getItem("authToken");

        var usId = localStorage.getItem("userId");
        if(!isPositiveNumber(message.toId))
            setAlertMessage("Sender ID must be a positive number");
        else if(parseInt(usId, 10) == parseInt(message.toId, 10))
            setAlertMessage("You can't send a message to yourself");
        else if(!(await checkClientExists(parseInt(message.toId, 10))))
            setAlertMessage("Receiver does not exist");
        else if(message.theme == "" && message.subject == "")
            setAlertMessage("You can't send an empty message");
        else
        {
            const newOutmsg = {
                fromId: parseInt(usId, 10),
                toId: parseInt(message.toId, 10),
                theme: message.theme,
                subject: message.subject
            };
            
            setOutmsg(newOutmsg);
    
            try {
                console.log(newOutmsg);  // Логируйте новое состояние до отправки
                
                await sendMessage(token, newOutmsg);  // Используйте newOutmsg здесь
                setAlertMessage("Message sent successfully");
                setMessage({
                    fromId: "",
                    toId: "",
                    theme: "",
                    subject: ""
                });
    
            } catch (err) {
                setAlertMessage("Message was not sent. " + err.message);
            }
        }
        setLoading(false);
    };

    if (loading) {
        return <p className="loading">Loading...</p>;
    }
    if(!isAuthenticated)
        return <p className="loading">You need to sign in to see this page...</p>;

    return (
        <div className="message-page">
            <div className="message-card">
                <input
                    type="text" 
                    value={message.toId}
                    onChange={(e) => handleInternalChange("toId", e.target.value)}
                    placeholder="Enter sender ID"
                />
                <input
                    type="text"
                    value={message.theme}
                    onChange={(e) => handleInternalChange("theme", e.target.value)}
                    placeholder="Enter message theme"
                />
                <textarea
                    value={message.subject}
                    onChange={(e) => handleInternalChange("subject", e.target.value)}
                    placeholder="Enter message subject"
                />

                <button onClick={() => handleSubmit()}>Submit</button>

                {alertMessage && <Alert message={alertMessage} onClose={handleAlertClose}/>}

            </div>
            <button onClick={() => getMessages()}>Update</button>
            <div className="message-container">
                <h3>Incoming Messages</h3>
                {toList.map((msg) => (
                    <div key={msg.id} className="message-item">
                        <p><strong>From:</strong> {String(msg.from_id)}</p>
                        <p><strong>Theme:</strong> {msg.theme}</p>
                        <p>{msg.subject}</p>
                        <p><strong>Date:</strong> {msg.date}</p>
                    </div>
                ))}
            </div>
            <div className="message-container">
                <h3>Outgoing Messages</h3>
                {fromList.map((msg) => (
                    <div key={msg.id} className="message-item">
                        <p><strong>To:</strong> {String(msg.to_id)}</p>
                        <p><strong>Theme:</strong> {msg.theme}</p>
                        <p>{msg.subject}</p>
                        <p><strong>Date:</strong> {msg.date}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default MessageForm;