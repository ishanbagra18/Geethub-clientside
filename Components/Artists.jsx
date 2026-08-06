import { useEffect, useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import { Music2, Verified, Play } from 'lucide-react'
import API_BASE_URL from '../src/config/api'

const Artists = () => {
  const [artists, setArtists] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    const fetchArtists = async () => {
      try {
        const token = localStorage.getItem("token")
        const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {}

        const response = await axios.get(`${API_BASE_URL}/artists`, config)
        const artistsList = response.data.artists || []

        const shuffled = [...artistsList].sort(() => 0.5 - Math.random())
        setArtists(shuffled.slice(0, 10))
      } catch (error) {
        console.error("Error fetching artists:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchArtists()
  }, [])

  // Sleek Skeleton Loader
  if (loading) {
    return (
      <div className="w-full px-4 md:px-8 py-8">
        <div className="mb-6">
          <div className="h-8 bg-gray-800 rounded-md w-48 mb-2 animate-pulse"></div>
          <div className="h-4 bg-gray-800 rounded-md w-64 animate-pulse"></div>
        </div>
        <div className="flex gap-6 overflow-hidden">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="flex-shrink-0 w-40 flex flex-col items-center gap-4 animate-pulse">
              <div className="w-40 h-40 rounded-full bg-gray-800/80"></div>
              <div className="w-24 h-4 bg-gray-800/80 rounded"></div>
              <div className="w-16 h-3 bg-gray-800/80 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="w-full px-4 md:px-8 py-8 bg-gradient-to-b from-transparent to-black/20 rounded-2xl">
      {/* Header section with gradient text */}
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 mb-1 tracking-tight">
            Featured Artists
          </h2>
          <p className="text-gray-400 text-sm font-medium">
            Discover your favorite music creators
          </p>
        </div>
      </div>

      {/* Artists Row with hidden scrollbar for cleaner look */}
      <div className="flex gap-6 overflow-x-auto pb-6 pt-2 snap-x snap-mandatory hide-scrollbar">
        
        {artists.map((artist) => (
          <div
            key={artist.artist_id}
            onClick={() => navigate(`/artist/${artist.artist_id}`)}
            className="group cursor-pointer flex-shrink-0 w-40 snap-start flex flex-col items-center"
          >
            {/* Image Container */}
            <div className="relative mb-4">
              <div className="w-40 h-40 rounded-full overflow-hidden relative
                bg-gray-800 shadow-xl shadow-black/40
                group-hover:shadow-blue-500/20 group-hover:shadow-2xl 
                transition-all duration-300 ease-out z-10">
                
                <img
                  src={artist.image_url || 'https://via.placeholder.com/150'}
                  alt={artist.name}
                  className="w-full h-full object-cover 
                    group-hover:scale-105 group-hover:opacity-60 transition-all duration-500"
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/150'
                  }}
                />

                {/* Hover Play Icon Overlay */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="bg-blue-500 rounded-full p-3 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                    <Play className="w-6 h-6 text-white ml-1" fill="currentColor" />
                  </div>
                </div>
              </div>

              {/* Verified Badge - Anchored to the bottom right with a border cutout effect */}
              {artist.verified && (
                <div className="absolute bottom-2 right-2 z-20 bg-blue-500 rounded-full p-[3px] 
                  border-[3px] border-[#121212] shadow-sm transform group-hover:scale-110 transition-transform">
                  <Verified className="w-4 h-4 text-white" fill="currentColor" />
                </div>
              )}
            </div>

            {/* Info Section */}
            <div className="text-center w-full px-2">
              <h3 className="font-bold text-white text-base truncate group-hover:text-blue-400 transition-colors duration-200">
                {artist.name}
              </h3>

              {artist.genre?.length > 0 ? (
                <p className="text-xs text-gray-400 mt-1 uppercase tracking-wider font-semibold truncate">
                  {artist.genre[0]}
                </p>
              ) : (
                <p className="text-xs text-gray-500 mt-1 uppercase tracking-wider font-semibold truncate">
                  Artist
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {artists.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 bg-gray-900/30 rounded-2xl border border-white/5 mt-4">
          <div className="bg-gray-800/50 p-4 rounded-full mb-4">
            <Music2 className="w-8 h-8 text-gray-500" />
          </div>
          <h3 className="text-white font-semibold mb-1">No artists found</h3>
          <p className="text-gray-400 text-sm">Check back later for new music</p>
        </div>
      )}
    </div>
  )
}

export default Artists