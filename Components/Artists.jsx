import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import { Music2, Verified } from 'lucide-react'

const Artists = () => {
  const [artists, setArtists] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    const fetchArtists = async () => {
      try {
        const token = localStorage.getItem("token")
        if (!token) return

        const config = {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }

        const response = await axios.get("http://localhost:9000/artists", config)

        const shuffled = response.data.artists.sort(() => 0.5 - Math.random())
        setArtists(shuffled.slice(0, 10))
      } catch (error) {
        console.error("Error fetching artists:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchArtists()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="w-full px-4 md:px-8 py-6">
      {/* Header */}
      <div className="mb-4">
        <h2 className="text-xl md:text-2xl font-black text-white mb-1">
          Featured Artists
        </h2>
        <p className="text-gray-400 text-xs">
          Discover your favorite music creators
        </p>
      </div>

      {/* Artists Row */}
      <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-gray-700">
        {artists.map((artist) => (
          <div
            key={artist.artist_id}
            onClick={() => navigate(`/artist/${artist.artist_id}`)}
            className="group cursor-pointer flex-shrink-0 w-36"
          >
            {/* Image */}
            <div className="relative mb-3">
              <div className="w-36 h-36 rounded-full overflow-hidden 
                bg-gradient-to-br from-blue-500/20 to-purple-500/20 
                border-2 border-white/10 
                group-hover:border-blue-500/60 
                transition-all duration-300 shadow-lg">

                <img
                  src={artist.image_url || 'https://via.placeholder.com/150'}
                  alt={artist.name}
                  className="w-full h-full object-cover 
                    group-hover:scale-110 transition-transform duration-300"
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/150'
                  }}
                />
              </div>

              {/* Verified Badge */}
              {artist.verified && (
                <div className="absolute top-1 right-1 bg-blue-500 rounded-full p-1">
                  <Verified className="w-4 h-4 text-white" fill="currentColor" />
                </div>
              )}
            </div>

            {/* Info */}
            <div className="text-center">
              <h3 className="font-bold text-white text-sm truncate group-hover:text-blue-400">
                {artist.name}
              </h3>

              {artist.genre?.length > 0 && (
                <p className="text-[11px] text-gray-400 truncate">
                  {artist.genre[0]}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {artists.length === 0 && (
        <div className="text-center py-12">
          <Music2 className="w-12 h-12 text-gray-600 mx-auto mb-3" />
          <p className="text-gray-400 text-sm">No artists found</p>
        </div>
      )}
    </div>
  )
}

export default Artists
