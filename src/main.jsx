import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./index.css";
import { UserProvider } from "./context/UserContext";
import { PlaylistProvider } from "./context/PlaylistContext";
import { HistoryContextProvider } from "./context/historyContext.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <UserProvider>
      <PlaylistProvider>
        <HistoryContextProvider>
      <App />
        </HistoryContextProvider>
      </PlaylistProvider>
    </UserProvider>
  </BrowserRouter>
);
