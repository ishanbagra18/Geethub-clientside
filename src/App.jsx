import { Routes, Route } from "react-router-dom";
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
import Dashboard from "../Components/Dashboard";
import { MusicPlayerProvider } from "./context/MusicPlayerContext";
import { MusicSectionsProvider } from "./context/MusicSectionsContext";
import GlobalMusicPlayer from "../Components/GlobalMusicPlayer";
import SeeAllTopCharts from "./pages/SeeAllTopCharts";
import SeeAllMostLiked from "./pages/SeeAllMostLiked";
import SeeAllMostSaved from "./pages/SeeAllMostSaved";
import SeeAllHindiSongs from "./pages/SeeAllHindiSongs";
import SeeAllPunjabiSongs from "./pages/SeeAllPunjabiSongs";
import SeeAllCommunityPlaylists from "./pages/SeeAllCommunityPlaylists";
import TrendingPage from "./pages/TrendingPage";
import Artistdes from "./pages/Artistdes";
import Myfollowing from "./pages/Myfollowing";
import Mymostplayed from "./pages/Mymostplayed";
import UsersList from "./pages/UsersList";
import ChatConversation from "./pages/ChatConversation";

function App() {
  return (
    <MusicPlayerProvider>
      <MusicSectionsProvider>
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
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/forgotpassword" element={<ForgotPassword />} />
          <Route path="/myprofile" element={<MyProfile />} />
          <Route path="/updateprofile" element={<UpdateProfile />} />
          <Route path="/playsong/:id" element={<PlaySong />} />
          <Route path="/playlist/:id" element={<Playlist />} />
          <Route path="/mylibrary" element={<Mylibrary />} />
          <Route path="/topcharts" element={<SeeAllTopCharts />} />
          <Route path="/mostliked" element={<SeeAllMostLiked />} />
          <Route path="/mostsaved" element={<SeeAllMostSaved />} />
          <Route path="/hindisongs" element={<SeeAllHindiSongs />} />
          <Route path="/punjabisongs" element={<SeeAllPunjabiSongs />} />
          <Route path="/communityplaylists" element={<SeeAllCommunityPlaylists />} />
          <Route path="/trending" element={<TrendingPage />} />
          <Route path="/artist/:id" element={<Artistdes />} />
          <Route path="/myfollowing" element={<Myfollowing />} />
          <Route path="/mymostplayed" element={<Mymostplayed />} />
          <Route path="/messages" element={<UsersList />} />
          <Route path="/messages/:userId" element={<ChatConversation />} />
        </Routes>

        {/* Global Music Player Bar */}
        <GlobalMusicPlayer />
      </MusicSectionsProvider>
    </MusicPlayerProvider>
  );
}

export default App;
