import React, { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Square, Play, Pause, Trash2 } from 'lucide-react';

const VoiceRecorder = ({ onRecordingComplete, onCancel }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);
  
  const mediaRecorderRef = useRef(null);
  const audioRef = useRef(null);
  const intervalRef = useRef(null);
  const chunksRef = useRef([]);

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      chunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        
        // Stop all tracks to release the microphone
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      setDuration(0);

      // Start duration timer
      intervalRef.current = setInterval(() => {
        setDuration(prev => prev + 1);
      }, 1000);

    } catch (error) {
      console.error('Error accessing microphone:', error);
      alert('Could not access microphone. Please check permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const togglePlayback = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleAudioEnded = () => {
    setIsPlaying(false);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSend = () => {
    if (audioBlob) {
      // Create a File object from the blob
      const audioFile = new File([audioBlob], `voice-message-${Date.now()}.webm`, {
        type: 'audio/webm'
      });
      onRecordingComplete(audioFile);
    }
  };

  const handleCancel = () => {
    if (isRecording) {
      stopRecording();
    }
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
    setAudioBlob(null);
    setAudioUrl(null);
    setDuration(0);
    onCancel();
  };

  return (
    <div className="p-4 bg-gray-800 rounded-lg border border-gray-600 mb-4">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-medium text-gray-200">Voice Message</h4>
        <button
          onClick={handleCancel}
          className="p-1 text-gray-400 hover:text-red-400 hover:bg-gray-700 rounded-full transition-colors"
          title="Cancel recording"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      <div className="flex items-center space-x-4">
        {/* Recording Controls */}
        <div className="flex items-center space-x-2">
          {!isRecording && !audioBlob && (
            <button
              onClick={startRecording}
              className="p-3 bg-red-600 hover:bg-red-700 rounded-full text-white transition-colors"
              title="Start recording"
            >
              <Mic className="h-4 w-4" />
            </button>
          )}

          {isRecording && (
            <button
              onClick={stopRecording}
              className="p-3 bg-red-600 animate-pulse rounded-full text-white"
              title="Stop recording"
            >
              <Square className="h-4 w-4" />
            </button>
          )}

          {audioBlob && !isRecording && (
            <button
              onClick={togglePlayback}
              className="p-3 bg-violet-600 hover:bg-violet-700 rounded-full text-white transition-colors"
              title={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </button>
          )}
        </div>

        {/* Duration/Waveform */}
        <div className="flex-1">
          {isRecording && (
            <div className="flex items-center space-x-2">
              <div className="flex space-x-1">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className="w-1 bg-red-500 rounded-full animate-pulse"
                    style={{
                      height: `${Math.random() * 20 + 8}px`,
                      animationDelay: `${i * 0.1}s`
                    }}
                  />
                ))}
              </div>
              <span className="text-sm text-gray-300">{formatTime(duration)}</span>
            </div>
          )}

          {audioBlob && (
            <div className="flex items-center space-x-2">
              <audio
                ref={audioRef}
                src={audioUrl}
                onEnded={handleAudioEnded}
                className="hidden"
              />
              <div className="flex-1 h-2 bg-gray-700 rounded-full overflow-hidden">
                <div className="h-full bg-violet-500 rounded-full w-1/3"></div>
              </div>
              <span className="text-sm text-gray-300">{formatTime(duration)}</span>
            </div>
          )}
        </div>

        {/* Send Button */}
        {audioBlob && !isRecording && (
          <button
            onClick={handleSend}
            className="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-full transition-colors text-sm font-medium"
          >
            Send
          </button>
        )}
      </div>

      {isRecording && (
        <div className="mt-2 text-xs text-gray-400 flex items-center">
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse mr-2"></div>
          Recording... Tap stop when finished
        </div>
      )}
    </div>
  );
};

export default VoiceRecorder;