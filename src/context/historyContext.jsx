import {createContext, useContext, useState} from 'react';
import axios from 'axios';
import { useEffect } from  'react';


const HistoryContext = createContext();


//custom hook 

export const useHistory = () => useContext(HistoryContext);

const getUserIdFromToken = () => {
    try {
        const token = localStorage.getItem("token");
        if (!token) return null;
        const payload = JSON.parse(atob(token.split(".")[1]));
        return payload.Uid; // 👈 matches your backend JWT
    }
    catch (err) {
        console.error("Token decode error:", err);
        return null;
    }
};


export const HistoryContextProvider = ({children}) => {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);


    useEffect(() => {
        const fetchHistory = async () => {
            try {
                setLoading(true);
                const token = localStorage.getItem("token");
                const userId = getUserIdFromToken();

                if (!token || !userId) {
                    setHistory([]);
                    setLoading(false);
                    return;
                }


                const res = await axios.get(
                    `http://localhost:9000/history/my`,
                    {   
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                setHistory(res.data.history);
            } catch (err) {
                console.error("HistoryContext fetch error:", err);
                setError(err);
            }
            finally {
                setLoading(false);
            }

        };

        fetchHistory();
    }
    , []);
    return (
        <HistoryContext.Provider value={{history, loading, error}}>
            {children}
        </HistoryContext.Provider>
    );
}

