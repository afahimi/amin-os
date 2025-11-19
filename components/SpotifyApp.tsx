import React, { useState, useRef, useEffect } from 'react';
import { Home, Search, Library, PlusSquare, Heart, Play, Pause, SkipBack, SkipForward, Repeat, Shuffle, Volume2, Mic2, Layers, Monitor, Maximize2 } from 'lucide-react';
import { SONGS, PLAYLISTS, Song } from '../utils/spotifyData';

const SpotifyApp: React.FC = () => {
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.7);
  const [progress, setProgress] = useState(0);
  const [activePlaylist, setActivePlaylist] = useState(PLAYLISTS[0]);
  
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  useEffect(() => {
    if (currentSong && isPlaying) {
      audioRef.current?.play().catch(e => console.error("Audio play failed", e));
    } else {
      audioRef.current?.pause();
    }
  }, [currentSong, isPlaying]);

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const current = audioRef.current.currentTime;
      const duration = audioRef.current.duration || 1;
      setProgress((current / duration) * 100);
    }
  };

  const handleSongSelect = (song: Song) => {
    if (currentSong?.id === song.id) {
      setIsPlaying(!isPlaying);
    } else {
      setCurrentSong(song);
      setIsPlaying(true);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col h-full bg-black text-white font-sans select-none">
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="w-64 bg-black flex flex-col gap-2 p-2">
          <div className="bg-[#121212] rounded-lg p-4 flex flex-col gap-4">
            <div className="flex items-center gap-4 text-gray-400 hover:text-white transition-colors cursor-pointer font-bold">
              <Home size={24} /> Home
            </div>
            <div className="flex items-center gap-4 text-gray-400 hover:text-white transition-colors cursor-pointer font-bold">
              <Search size={24} /> Search
            </div>
          </div>
          
          <div className="bg-[#121212] rounded-lg flex-1 p-4 flex flex-col overflow-hidden">
            <div className="flex items-center justify-between text-gray-400 mb-4">
              <div className="flex items-center gap-2 hover:text-white cursor-pointer font-bold">
                <Library size={24} /> Your Library
              </div>
              <PlusSquare size={20} className="hover:text-white cursor-pointer" />
            </div>
            
            <div className="flex gap-2 mb-4">
               <span className="bg-[#232323] px-3 py-1 rounded-full text-sm cursor-pointer hover:bg-[#2a2a2a]">Playlists</span>
               <span className="bg-[#232323] px-3 py-1 rounded-full text-sm cursor-pointer hover:bg-[#2a2a2a]">Artists</span>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 custom-scrollbar">
               <div className="flex items-center gap-3 p-2 hover:bg-[#1a1a1a] rounded cursor-pointer" onClick={() => setActivePlaylist(PLAYLISTS[0])}>
                  <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-blue-300 flex items-center justify-center rounded">
                    <Heart fill="white" size={20} />
                  </div>
                  <div>
                    <div className="font-medium text-green-500">Liked Songs</div>
                    <div className="text-xs text-gray-400">Playlist • 5 songs</div>
                  </div>
               </div>
               {PLAYLISTS.slice(1).map(playlist => (
                 <div key={playlist.id} className="flex items-center gap-3 p-2 hover:bg-[#1a1a1a] rounded cursor-pointer" onClick={() => setActivePlaylist(playlist)}>
                    <img src={playlist.coverUrl} alt={playlist.name} className="w-12 h-12 rounded object-cover" />
                    <div>
                      <div className={`font-medium ${activePlaylist.id === playlist.id ? 'text-green-500' : ''}`}>{playlist.name}</div>
                      <div className="text-xs text-gray-400">Playlist • AminOS</div>
                    </div>
                 </div>
               ))}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 bg-[#121212] m-2 ml-0 rounded-lg overflow-hidden flex flex-col relative">
           {/* Header Gradient */}
           <div className="absolute top-0 left-0 right-0 h-64 bg-gradient-to-b from-indigo-900/50 to-[#121212] pointer-events-none" />
           
           {/* Content */}
           <div className="relative z-10 flex-1 overflow-y-auto p-6 custom-scrollbar">
              <div className="flex items-end gap-6 mb-6">
                 <img src={activePlaylist.coverUrl} alt={activePlaylist.name} className="w-52 h-52 shadow-2xl shadow-black/50" />
                 <div>
                    <div className="text-sm font-bold uppercase">Playlist</div>
                    <h1 className="text-7xl font-black tracking-tighter mb-4">{activePlaylist.name}</h1>
                    <div className="text-sm text-gray-300 font-medium flex items-center gap-1">
                       <span className="text-white font-bold">AminOS</span> • {activePlaylist.description} • <span className="text-white font-bold">{activePlaylist.songs.length} songs</span>
                    </div>
                 </div>
              </div>

              <div className="mb-6">
                 <button className="w-14 h-14 rounded-full bg-[#1ed760] flex items-center justify-center hover:scale-105 transition-transform shadow-lg text-black">
                    <Play fill="black" size={28} className="ml-1" />
                 </button>
              </div>

              <div className="grid grid-cols-[16px_1fr_1fr_auto] gap-4 text-gray-400 border-b border-white/10 pb-2 mb-4 px-4 text-sm uppercase font-medium">
                 <div>#</div>
                 <div>Title</div>
                 <div>Album</div>
                 <div><Monitor size={16} /></div>
              </div>

              <div className="space-y-2">
                 {activePlaylist.songs.map((songId, index) => {
                    const song = SONGS.find(s => s.id === songId);
                    if (!song) return null;
                    const isCurrent = currentSong?.id === song.id;
                    
                    return (
                       <div 
                          key={song.id} 
                          className="grid grid-cols-[16px_1fr_1fr_auto] gap-4 items-center p-2 px-4 rounded hover:bg-white/10 group cursor-pointer text-sm text-gray-400 hover:text-white transition-colors"
                          onClick={() => handleSongSelect(song)}
                       >
                          <div className="flex items-center justify-center w-4">
                             {isCurrent && isPlaying ? (
                                <img src="https://open.spotifycdn.com/cdn/images/equaliser-animated-green.f93a2ef4.gif" className="h-3" alt="playing" />
                             ) : (
                                <span className="group-hover:hidden">{index + 1}</span>
                             )}
                             <Play size={12} fill="white" className="hidden group-hover:block text-white absolute" />
                          </div>
                          <div className="flex items-center gap-3">
                             <img src={song.coverUrl} className="w-10 h-10 rounded" alt={song.title} />
                             <div>
                                <div className={`font-medium text-base ${isCurrent ? 'text-[#1ed760]' : 'text-white'}`}>{song.title}</div>
                                <div className="text-sm">{song.artist}</div>
                             </div>
                          </div>
                          <div className="group-hover:text-white">{song.album}</div>
                          <div>{formatTime(song.duration)}</div>
                       </div>
                    );
                 })}
              </div>
           </div>
        </div>
      </div>

      {/* Player Bar */}
      <div className="h-20 bg-black border-t border-[#282828] px-4 flex items-center justify-between z-50">
         <div className="flex items-center gap-4 w-[30%]">
            {currentSong && (
               <>
                  <img src={currentSong.coverUrl} className="w-14 h-14 rounded shadow-lg" alt="cover" />
                  <div>
                     <div className="text-sm font-medium hover:underline cursor-pointer">{currentSong.title}</div>
                     <div className="text-xs text-gray-400 hover:underline cursor-pointer hover:text-white">{currentSong.artist}</div>
                  </div>
                  <Heart size={16} className="text-[#1ed760] ml-2 cursor-pointer" />
               </>
            )}
         </div>

         <div className="flex flex-col items-center w-[40%] max-w-2xl gap-2">
            <div className="flex items-center gap-6 text-gray-400">
               <Shuffle size={16} className="hover:text-white cursor-pointer" />
               <SkipBack size={20} className="hover:text-white cursor-pointer fill-current" />
               <button 
                  className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-black hover:scale-105 transition-transform"
                  onClick={() => setIsPlaying(!isPlaying)}
               >
                  {isPlaying ? <Pause size={20} fill="black" /> : <Play size={20} fill="black" className="ml-0.5" />}
               </button>
               <SkipForward size={20} className="hover:text-white cursor-pointer fill-current" />
               <Repeat size={16} className="hover:text-white cursor-pointer" />
            </div>
            <div className="w-full flex items-center gap-2 text-xs text-gray-400 font-mono">
               <span>{currentSong ? formatTime((progress / 100) * currentSong.duration) : "0:00"}</span>
               <div 
                  className="h-1 flex-1 bg-[#4d4d4d] rounded-full overflow-hidden group cursor-pointer relative"
                  onClick={(e) => {
                     if (!audioRef.current || !currentSong) return;
                     const rect = e.currentTarget.getBoundingClientRect();
                     const x = e.clientX - rect.left;
                     const percentage = x / rect.width;
                     const newTime = percentage * currentSong.duration;
                     audioRef.current.currentTime = newTime;
                     setProgress(percentage * 100);
                  }}
               >
                  <div className="h-full bg-white group-hover:bg-[#1ed760] relative" style={{ width: `${progress}%` }}></div>
               </div>
               <span>{currentSong ? formatTime(currentSong.duration) : "0:00"}</span>
            </div>
         </div>

         <div className="flex items-center justify-end gap-3 w-[30%] text-gray-400">
            <Mic2 size={16} className="hover:text-white cursor-pointer" />
            <Layers size={16} className="hover:text-white cursor-pointer" />
            <Monitor size={16} className="hover:text-white cursor-pointer" />
            <div className="flex items-center gap-2 w-24 group">
               <Volume2 size={16} className="hover:text-white cursor-pointer" />
               <div className="h-1 flex-1 bg-[#4d4d4d] rounded-full overflow-hidden cursor-pointer">
                  <div className="h-full bg-white group-hover:bg-[#1ed760]" style={{ width: `${volume * 100}%` }}></div>
               </div>
            </div>
            <Maximize2 size={16} className="hover:text-white cursor-pointer" />
         </div>
      </div>

      <audio 
         ref={audioRef} 
         src={currentSong?.audioUrl} 
         onTimeUpdate={handleTimeUpdate}
         onEnded={() => setIsPlaying(false)}
      />
    </div>
  );
};

export default SpotifyApp;
