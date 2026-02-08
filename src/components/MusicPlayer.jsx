import React, { useState, useEffect, useRef } from 'react';

const MusicPlayer = () => {
    const [isPlaying, setIsPlaying] = useState(false);
    const audioRef = useRef(null);
    const [hasError, setHasError] = useState(false);

    // Using locally hosted file for stability
    // Currently using a stable placeholder (SoundHelix) due to download restrictions on other sites.
    // Replace 'public/music/song.mp3' with your own romantic track!
    const songUrl = "/music/song.mp3";

    const togglePlay = (e) => {
        // Prevent click from bubbling up to document listener
        e.stopPropagation();

        if (!audioRef.current) return;

        if (isPlaying) {
            audioRef.current.pause();
            setIsPlaying(false);
        } else {
            const playPromise = audioRef.current.play();
            if (playPromise !== undefined) {
                playPromise.then(() => {
                    setIsPlaying(true);
                    setHasError(false);
                }).catch(err => {
                    console.error("Playback failed:", err);
                    setHasError(true);
                });
            }
        }
    };

    useEffect(() => {
        // Unlock audio context on first user interaction (essential for mobile)
        const unlockAudio = () => {
            if (audioRef.current && audioRef.current.paused && !isPlaying) {
                audioRef.current.play()
                    .then(() => {
                        setIsPlaying(true);
                        setHasError(false);
                    })
                    .catch(() => {
                        // Silent fail - user will use the button
                    });

                // Remove listeners immediately after first attempt
                cleanUpListeners();
            }
        };

        const cleanUpListeners = () => {
            document.removeEventListener('click', unlockAudio);
            document.removeEventListener('touchstart', unlockAudio);
        };

        document.addEventListener('click', unlockAudio);
        document.addEventListener('touchstart', unlockAudio);

        return () => cleanUpListeners();
    }, []); // Empty dependency array - run once on mount

    return (
        <div className="fixed top-4 right-4 z-50 flex flex-col items-end gap-2">
            <audio
                ref={audioRef}
                src={songUrl}
                loop
                crossOrigin="anonymous"
                onError={() => setHasError(true)}
            />
            <button
                onClick={togglePlay}
                className={`bg-white/90 backdrop-blur-sm p-3 rounded-full shadow-lg border transition-all hover:scale-110 active:scale-95 animate-fade-in ${hasError ? 'border-red-300 text-red-500' : 'border-pink-200 text-pink-500 hover:bg-pink-50'
                    }`}
                title={hasError ? "Music failed to load" : (isPlaying ? "Pause Music" : "Play Music")}
            >
                {hasError ? '⚠️' : (isPlaying ? '🎵' : '🔇')}
            </button>
        </div>
    );
};

export default MusicPlayer;
