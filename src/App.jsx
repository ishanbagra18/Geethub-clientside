import { Routes, Route } from "react-router-dom";
import React from "react";
import { Toaster } from "react-hot-toast";

import Loginpage from "./pages/Loginpage";
import Signuppage from "./pages/Signuppage";
import Homepage from "./pages/Homepage";
import ForgotPassword from "./pages/ForgotPassword";
import MyProfile from "./pages/MyProfile";
import UpdateProfile from "./pages/UpdateProfile";
import PlaySong from "./pages/PlaySong";
import Playlist from "./pages/Playlist";
import Mylibrary from "./pages/Mylibrary";

function App() {
  return (
    <>
      {/* 🔥 Toast container (GLOBAL) */}
      <Toaster
        position="top-right"
        reverseOrder={false}
        toastOptions={{
          duration: 3000,
        }}
      />

      <Routes>
        <Route path="/login" element={<Loginpage />} />
        <Route path="/signup" element={<Signuppage />} />
        <Route path="/" element={<Homepage />} />
        <Route path="/forgotpassword" element={<ForgotPassword />} />
        <Route path="/myprofile" element={<MyProfile />} />
        <Route path="/updateprofile" element={<UpdateProfile />} />
        <Route path="/playsong/:id" element={<PlaySong />} />
        <Route path="/playlist/:id" element={<Playlist />} />
        <Route path="/mylibrary" element={<Mylibrary />} />
      </Routes>
    </>
  );
}

export default App;
