import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, Play, Pause, Square, Trash2 } from "lucide-react";

interface VoiceRecorderProps {
  onRecordingComplete: (audioBlob: Blob) => void;
  onRecordingClear?: () => void;
  existingAudioUrl?: string;
  disabled?: boolean;
  className?: string;
}

export function VoiceRecorder({
  onRecordingComplete,
  onRecordingClear,
  existingAudioUrl,
  disabled = false,
  className = ""
}: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [playbackPosition, setPlaybackPosition] = useState(0);
  const [recordedAudioUrl, setRecordedAudioUrl] = useState<string | null>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    // Check if browser supports media recording
    if (!navigator.mediaDevices || !window.MediaRecorder) {
      setHasPermission(false);
      return;
    }

    // Request microphone permission on component mount
    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then((stream) => {
        setHasPermission(true);
        stream.getTracks().forEach((track) => track.stop()); // Stop immediately after checking permission
      })
      .catch(() => {
        setHasPermission(false);
      });
  }, []);

  useEffect(() => {
    // Clean up when component unmounts
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (recordedAudioUrl) {
        URL.revokeObjectURL(recordedAudioUrl);
      }
    };
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/mp4'
      });
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { 
          type: mediaRecorder.mimeType || 'audio/webm' 
        });
        const audioUrl = URL.createObjectURL(audioBlob);
        setRecordedAudioUrl(audioUrl);
        onRecordingComplete(audioBlob);

        // Clean up stream
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((track) => track.stop());
          streamRef.current = null;
        }
      };

      mediaRecorder.start(100); // Collect data every 100ms
      setIsRecording(true);
      setIsPaused(false);
      setRecordingDuration(0);

      // Start duration timer
      intervalRef.current = setInterval(() => {
        setRecordingDuration((prev) => prev + 1);
      }, 1000);

    } catch (error) {
      console.error('Error accessing microphone:', error);
      setHasPermission(false);
    }
  };

  const pauseRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.pause();
      setIsPaused(true);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }
  };

  const resumeRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'paused') {
      mediaRecorderRef.current.resume();
      setIsPaused(false);
      intervalRef.current = setInterval(() => {
        setRecordingDuration((prev) => prev + 1);
      }, 1000);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsPaused(false);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }
  };

  const playRecording = () => {
    const audioUrl = recordedAudioUrl || existingAudioUrl;
    if (!audioUrl) return;

    if (audioPlayerRef.current) {
      audioPlayerRef.current.pause();
    }

    const audio = new Audio(audioUrl);
    audioPlayerRef.current = audio;

    audio.onplay = () => setIsPlaying(true);
    audio.onpause = () => setIsPlaying(false);
    audio.onended = () => {
      setIsPlaying(false);
      setPlaybackPosition(0);
    };
    audio.ontimeupdate = () => {
      setPlaybackPosition(audio.currentTime);
    };

    audio.play().catch(console.error);
  };

  const pausePlayback = () => {
    if (audioPlayerRef.current) {
      audioPlayerRef.current.pause();
    }
  };

  const clearRecording = () => {
    if (recordedAudioUrl) {
      URL.revokeObjectURL(recordedAudioUrl);
      setRecordedAudioUrl(null);
    }
    if (audioPlayerRef.current) {
      audioPlayerRef.current.pause();
      audioPlayerRef.current = null;
    }
    setIsPlaying(false);
    setPlaybackPosition(0);
    setRecordingDuration(0);
    onRecordingClear?.();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (hasPermission === false) {
    return (
      <div className={`p-4 border border-red-200 rounded-lg bg-red-50 ${className}`}>
        <p className="text-red-600 text-sm mb-2">
          Microphone access is required for voice recording
        </p>
        <Button
          onClick={() => window.location.reload()}
          variant="outline"
          size="sm"
          className="text-red-600 border-red-300 hover:bg-red-100"
        >
          Grant Permission
        </Button>
      </div>
    );
  }

  if (hasPermission === null) {
    return (
      <div className={`p-4 border border-gray-200 rounded-lg bg-gray-50 ${className}`}>
        <p className="text-gray-600 text-sm">Checking microphone permissions...</p>
      </div>
    );
  }

  const hasAudio = recordedAudioUrl || existingAudioUrl;

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Recording Controls */}
      <div className="flex items-center justify-between p-4 border border-amber-200 rounded-lg bg-amber-50">
        <div className="flex items-center space-x-3">
          {!isRecording ? (
            <Button
              onClick={startRecording}
              disabled={disabled}
              className="bg-red-500 hover:bg-red-600 text-white min-h-[44px] min-w-[44px]"
              data-testid="button-start-recording"
            >
              <Mic className="w-5 h-5" />
            </Button>
          ) : (
            <div className="flex items-center space-x-2">
              {!isPaused ? (
                <Button
                  onClick={pauseRecording}
                  disabled={disabled}
                  className="bg-yellow-500 hover:bg-yellow-600 text-white min-h-[44px] min-w-[44px]"
                  data-testid="button-pause-recording"
                >
                  <Pause className="w-5 h-5" />
                </Button>
              ) : (
                <Button
                  onClick={resumeRecording}
                  disabled={disabled}
                  className="bg-green-500 hover:bg-green-600 text-white min-h-[44px] min-w-[44px]"
                  data-testid="button-resume-recording"
                >
                  <Mic className="w-5 h-5" />
                </Button>
              )}
              <Button
                onClick={stopRecording}
                disabled={disabled}
                className="bg-red-600 hover:bg-red-700 text-white min-h-[44px] min-w-[44px]"
                data-testid="button-stop-recording"
              >
                <Square className="w-5 h-5" />
              </Button>
            </div>
          )}

          <div className="text-amber-900">
            {isRecording && (
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                <span className="font-medium">
                  {isPaused ? 'Paused' : 'Recording'} {formatTime(recordingDuration)}
                </span>
              </div>
            )}
            {!isRecording && !hasAudio && (
              <span className="text-amber-700">Click to start voice recording</span>
            )}
          </div>
        </div>

        {hasAudio && (
          <Button
            onClick={clearRecording}
            disabled={disabled}
            variant="outline"
            size="sm"
            className="text-red-500 border-red-300 hover:bg-red-50 min-h-[44px] min-w-[44px]"
            data-testid="button-clear-recording"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Playback Controls */}
      {hasAudio && (
        <div className="flex items-center justify-between p-4 border border-green-200 rounded-lg bg-green-50">
          <div className="flex items-center space-x-3">
            <Button
              onClick={isPlaying ? pausePlayback : playRecording}
              disabled={disabled}
              className="bg-green-500 hover:bg-green-600 text-white min-h-[44px] min-w-[44px]"
              data-testid="button-play-recording"
            >
              {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
            </Button>
            
            <div className="text-green-900">
              <span className="font-medium">
                {isPlaying ? 'Playing' : 'Ready to play'} 
                {recordingDuration > 0 && ` • ${formatTime(recordingDuration)}`}
              </span>
            </div>
          </div>

          {isPlaying && (
            <div className="text-green-700 text-sm">
              {formatTime(playbackPosition)}
            </div>
          )}
        </div>
      )}
    </div>
  );
}