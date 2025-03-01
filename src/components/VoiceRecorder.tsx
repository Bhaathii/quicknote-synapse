
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Mic, Square, Loader } from "lucide-react";
import { cn } from "@/lib/utils";

interface VoiceRecorderProps {
  onTranscription: (text: string) => void;
  isPremium?: boolean;
}

export function VoiceRecorder({ onTranscription, isPremium = false }: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);
  
  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        window.clearInterval(timerRef.current);
      }
      if (mediaRecorderRef.current && isRecording) {
        mediaRecorderRef.current.stop();
      }
    };
  }, [isRecording]);
  
  const startRecording = async () => {
    if (!isPremium) {
      alert("Voice recording is a premium feature. Upgrade to unlock!");
      return;
    }
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorder.onstop = handleRecordingStop;
      
      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      
      // Start timer
      timerRef.current = window.setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (error) {
      console.error("Error accessing microphone:", error);
      alert("Could not access microphone. Please check permissions.");
    }
  };
  
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      // Clear timer
      if (timerRef.current) {
        window.clearInterval(timerRef.current);
        timerRef.current = null;
      }
      setIsRecording(false);
    }
  };
  
  const handleRecordingStop = async () => {
    const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
    
    // Mock transcription process (in real app, you'd send to a speech-to-text API)
    setIsProcessing(true);
    
    // Simulate API call delay
    setTimeout(() => {
      // Mock transcription result
      const mockTranscription = "This is a simulated transcription of your voice recording. In a real application, this would be the text converted from your speech using a service like Google Speech-to-Text, Amazon Transcribe, or another speech recognition API.";
      
      onTranscription(mockTranscription);
      setIsProcessing(false);
    }, 2000);
  };
  
  // Format seconds to MM:SS
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };
  
  return (
    <div className="flex items-center gap-2">
      {isRecording ? (
        <>
          <div className="text-sm font-medium">
            {formatTime(recordingTime)}
          </div>
          <Button
            variant="destructive"
            size="icon"
            onClick={stopRecording}
            className="rounded-full"
            aria-label="Stop recording"
          >
            <Square className="h-4 w-4" />
          </Button>
        </>
      ) : isProcessing ? (
        <Button
          variant="outline"
          size="sm"
          disabled
          className="rounded-full"
        >
          <Loader className="h-4 w-4 mr-2 animate-spin" />
          Processing...
        </Button>
      ) : (
        <Button
          variant={isPremium ? "default" : "outline"}
          size="icon"
          onClick={startRecording}
          className={cn(
            "rounded-full",
            !isPremium && "opacity-50"
          )}
          aria-label="Start recording"
        >
          <Mic className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
