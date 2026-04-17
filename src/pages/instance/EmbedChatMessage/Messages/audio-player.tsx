import { Play, Pause } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { Button } from "@evoapi/design-system/button";
// Removed slider import - using native range input

interface AudioPlayerProps {
  audioUrl: string;
  fromMe: boolean;
  profilePicUrl?: string;
}

// const audioUrl = "http://webaudioapi.com/samples/audio-tag/chrono.mp3";

const AudioPlayer = ({ audioUrl, fromMe, profilePicUrl }: AudioPlayerProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Reset states when audio URL changes
    setIsPlaying(false);
    setProgress(0);
    setError(null);

    // Cria elemento de áudio
    const audio = new Audio();
    audioRef.current = audio;

    const handleError = (e: Event) => {
      const target = e.target as HTMLAudioElement;
      let errorMessage = "Erro ao carregar áudio";

      // Verifica o código de erro específico
      if (target.error) {
        switch (target.error.code) {
          case MediaError.MEDIA_ERR_ABORTED:
            errorMessage = "Reprodução cancelada";
            break;
          case MediaError.MEDIA_ERR_NETWORK:
            errorMessage = "Erro de rede ao carregar áudio";
            break;
          case MediaError.MEDIA_ERR_DECODE:
            errorMessage = "Erro ao decodificar áudio";
            break;
          case MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED:
            errorMessage = "Formato de áudio não suportado";
            break;
        }
      }

      setError(errorMessage);
      setIsPlaying(false);
      console.error("Erro de áudio:", errorMessage);
    };

    // Configura listeners
    audio.addEventListener("loadedmetadata", () => {
      setDuration(audio.duration);
    });

    audio.addEventListener("timeupdate", () => {
      if (audio.duration) {
        const current = audio.currentTime;
        setProgress((current / audio.duration) * 100);
      }
    });

    audio.addEventListener("ended", () => {
      setIsPlaying(false);
      setProgress(0);
    });

    audio.addEventListener("error", handleError);
    audio.src = audioUrl;

    // Cleanup
    return () => {
      if (audio) {
        audio.removeEventListener("error", handleError);
        audio.pause();
        audio.src = "";
      }
    };
  }, [audioUrl]);

  const togglePlay = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const formatTime = (seconds: number) => {
    if (!seconds || isNaN(seconds)) return "0:00";

    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleSliderChange = (value: number[]) => {
    if (!audioRef.current) return;
    const newTime = (value[0] / 100) * duration;
    audioRef.current.currentTime = newTime;
    setProgress(value[0]);
  };

  return (
    <div className="mb-2 flex w-[300px] items-center gap-2 rounded-lg bg-black/5 px-4 py-3 dark:bg-white/5">
      {!fromMe && profilePicUrl && (
        <div className="flex-shrink-0">
          <img src={profilePicUrl} alt="Profile" className="h-8 w-8 rounded-full object-cover" />
        </div>
      )}

      <div className="flex-shrink-0">
        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full p-1.5 hover:bg-black/10 dark:hover:bg-white/10" onClick={togglePlay} disabled={!!error}>
          {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
        </Button>
      </div>

      <div className="flex flex-grow flex-col gap-1">
        <input type="range" className="w-full" value={progress} max={100} step={1} onChange={(e) => handleSliderChange([Number(e.target.value)])} disabled={!!error} />
      </div>

      <div className="flex-shrink-0 text-xs text-muted-foreground">
        {formatTime(duration * (progress / 100))} / {formatTime(duration)}
      </div>
    </div>
  );
};

export { AudioPlayer };
