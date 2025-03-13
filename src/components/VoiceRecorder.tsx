
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Mic, Square, Loader } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLocation } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

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
  const recognitionRef = useRef<any | null>(null);
  const location = useLocation();
  const { toast } = useToast();
  
  // Check if user has premium from location state (after payment)
  const hasPremiumFromPayment = location.state?.isPremium || false;
  const userHasPremium = isPremium || hasPremiumFromPayment;
  
  // Check if browser supports SpeechRecognition
  const isSpeechRecognitionSupported = () => {
    return 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window;
  };
  
  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        window.clearInterval(timerRef.current);
      }
      if (mediaRecorderRef.current && isRecording) {
        mediaRecorderRef.current.stop();
      }
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [isRecording]);
  
  const startRecording = async () => {
    if (!userHasPremium) {
      toast({
        title: "Premium Feature",
        description: "Voice recording is a premium feature. Upgrade to unlock!",
        variant: "destructive",
      });
      return;
    }
    
    if (!isSpeechRecognitionSupported()) {
      toast({
        title: "Not Supported",
        description: "Speech recognition is not supported in your browser. Try Chrome or Edge.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      // Request microphone access
      await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Initialize speech recognition
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;
      
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US'; // Set language
      
      recognition.onstart = () => {
        setIsRecording(true);
        setRecordingTime(0);
        
        // Start timer
        timerRef.current = window.setInterval(() => {
          setRecordingTime((prev) => prev + 1);
        }, 1000);
      };
      
      recognition.onresult = (event) => {
        let interimTranscript = '';
        let finalTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }
        
        // If we have a final transcript, send it
        if (finalTranscript) {
          onTranscription(finalTranscript);
        }
      };
      
      recognition.onerror = (event) => {
        console.error('Speech recognition error', event.error);
        stopRecording();
        toast({
          title: "Recognition Error",
          description: `Error: ${event.error}. Please try again.`,
          variant: "destructive",
        });
      };
      
      recognition.onend = () => {
        if (isRecording) {
          stopRecording();
        }
      };
      
      // Start recognition
      recognition.start();
      
    } catch (error) {
      console.error("Error accessing microphone:", error);
      toast({
        title: "Microphone Error",
        description: "Could not access microphone. Please check permissions.",
        variant: "destructive",
      });
    }
  };
  
  const stopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    
    // Clear timer
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
    
    setIsRecording(false);
    setIsProcessing(false);
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
          variant={userHasPremium ? "default" : "outline"}
          size="icon"
          onClick={startRecording}
          className={cn(
            "rounded-full",
            !userHasPremium && "opacity-50"
          )}
          aria-label="Start recording"
        >
          <Mic className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
