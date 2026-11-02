import React, { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Volume2, Sparkles, Send, AlertCircle, CheckCircle2, Radio } from 'lucide-react';

export default function VoiceCommandSimulator({
  onVoiceCommand,
  activeRoomName = 'Living Room'
}) {
  const [inputText, setInputText] = useState('');
  const [lastResponse, setLastResponse] = useState('Voice Assistant ready. Click the microphone button or type a natural English command.');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState('');
  const [micError, setMicError] = useState(null);

  const recognitionRef = useRef(null);

  // Check Web Speech Recognition support
  const SpeechRecognition = typeof window !== 'undefined' 
    ? (window.SpeechRecognition || window.webkitSpeechRecognition) 
    : null;
  const isSpeechSupported = Boolean(SpeechRecognition);

  // Speech synthesis speaker
  const speakText = (text) => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 1.05;
        utterance.pitch = 1.05;
        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = () => setIsSpeaking(false);
        window.speechSynthesis.speak(utterance);
      } catch (e) {
        console.warn('SpeechSynthesis notice:', e);
      }
    }
  };

  const handleExecute = (promptText) => {
    if (!promptText || !promptText.trim()) return;
    const cleanPrompt = promptText.trim();
    const response = onVoiceCommand(cleanPrompt);
    const spokenReply = response || `Executed command for ${activeRoomName}: "${cleanPrompt}".`;
    setLastResponse(spokenReply);
    setInterimTranscript('');
    speakText(spokenReply);
  };

  const toggleListening = () => {
    // If currently listening, stop it
    if (isListening) {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          console.warn(e);
        }
      }
      setIsListening(false);
      return;
    }

    // Check support
    if (!isSpeechSupported) {
      setMicError('Speech Recognition is not supported in this browser. Please use Google Chrome or Microsoft Edge, or use the typed command input below.');
      return;
    }

    setMicError(null);
    setInterimTranscript('');

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'en-US';
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsListening(true);
        setMicError(null);
      };

      recognition.onresult = (event) => {
        let finalTranscript = '';
        let interim = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interim += event.results[i][0].transcript;
          }
        }

        if (interim) {
          setInterimTranscript(interim);
        }

        if (finalTranscript) {
          setInputText(finalTranscript);
          handleExecute(finalTranscript);
          setIsListening(false);
        }
      };

      recognition.onerror = (event) => {
        setIsListening(false);
        if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
          setMicError('Microphone access was denied. Please allow microphone permissions in your browser address bar.');
        } else if (event.error === 'no-speech') {
          setMicError('No speech was detected. Please click the microphone button and speak clearly into your mic.');
        } else {
          setMicError(`Voice Recognition notice: ${event.error}. You can also type commands in the box below.`);
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      setIsListening(false);
      setMicError(`Could not initiate speech recognition: ${err.message}. Please use typed commands.`);
    }
  };

  // Clean up recognition on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) {
          // ignore
        }
      }
    };
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    handleExecute(inputText.trim());
    setInputText('');
  };

  const samplePrompts = [
    'Turn fan on',
    'Turn fan off',
    'Set speed to level 4',
    'Engage AI auto mode',
    'Activate sleep mode',
    'Emergency smoke reverse mode'
  ];

  return (
    <div className="glass-panel" style={{ width: '100%' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
        <h2 className="card-title" style={{ margin: 0 }}>
          <Mic size={20} style={{ color: isListening ? 'var(--red-hazard)' : (isSpeaking ? 'var(--cyan-neon)' : '#C084FC') }} />
          Voice Assistant & Speech Recognition Interface
        </h2>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {isSpeaking && (
            <span className="badge badge-cyan" style={{ animation: 'pulseGlow 1s infinite' }}>
              <Volume2 size={12} /> AI SPEAKING...
            </span>
          )}

          {isListening && (
            <span className="badge badge-red" style={{ animation: 'pulseHazard 1s infinite' }}>
              <Radio size={12} /> LISTENING...
            </span>
          )}
        </div>
      </div>

      {/* Real Microphone Action Bar */}
      <div style={{
        background: isListening ? 'rgba(255, 51, 102, 0.12)' : 'rgba(5, 11, 23, 0.65)',
        border: `1.5px solid ${isListening ? 'var(--red-hazard)' : 'var(--border-cyan)'}`,
        borderRadius: '12px',
        padding: '1.1rem',
        marginBottom: '1.25rem',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.75rem',
        transition: 'all 0.3s ease'
      }}>
        {/* Big Click-to-Speak Microphone Button */}
        <button
          onClick={toggleListening}
          className={`btn-cyber ${isListening ? 'mic-listening' : 'btn-cyber-primary'}`}
          style={{
            padding: '0.85rem 1.6rem',
            borderRadius: '9999px',
            fontSize: '0.95rem',
            fontWeight: '700',
            letterSpacing: '0.02em',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.75rem',
            cursor: 'pointer'
          }}
          title={isListening ? "Click to stop listening" : "Click to speak a voice command"}
        >
          {isListening ? (
            <>
              <MicOff size={20} style={{ animation: 'spinForward 2s linear infinite' }} />
              Stop Listening
            </>
          ) : (
            <>
              <Mic size={20} />
              Start Voice Input (Click & Speak)
            </>
          )}
        </button>

        {/* Status Prompt & Live Speech Transcript */}
        <div style={{ textAlign: 'center' }}>
          {isListening ? (
            <div style={{ color: 'var(--red-hazard)', fontSize: '0.85rem', fontWeight: '600', fontFamily: 'var(--font-mono)' }}>
              {interimTranscript ? `"${interimTranscript}"` : "Listening for command... speak in English now"}
            </div>
          ) : (
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.78rem' }}>
              {isSpeechSupported 
                ? "Click the microphone button to give voice commands (e.g. 'Set speed 4', 'Turn on', 'Sleep mode')"
                : "Speech recognition not natively supported by this browser engine. Use the text input below."}
            </div>
          )}
        </div>

        {/* Error notification banner if mic permission denied or unsupported */}
        {micError && (
          <div style={{
            width: '100%',
            background: 'rgba(255, 51, 102, 0.2)',
            border: '1px solid var(--red-hazard)',
            borderRadius: '8px',
            padding: '0.5rem 0.8rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '0.5rem',
            fontSize: '0.75rem',
            color: '#FFE4E9'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <AlertCircle size={14} style={{ color: 'var(--red-hazard)', flexShrink: 0 }} />
              <span>{micError}</span>
            </div>
            <button
              onClick={() => setMicError(null)}
              style={{ background: 'transparent', border: 'none', color: '#FFFFFF', cursor: 'pointer', fontSize: '0.75rem', textDecoration: 'underline' }}
            >
              Dismiss
            </button>
          </div>
        )}
      </div>

      {/* Preset Command Prompt Chips for Rapid Testing */}
      <div style={{ marginBottom: '1.25rem' }}>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.4rem', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>
          Quick Voice Simulation Chips (Or Speak Aloud):
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
          {samplePrompts.map((promptText, idx) => (
            <button
              key={idx}
              onClick={() => handleExecute(promptText)}
              className="btn-cyber"
              style={{
                padding: '0.35rem 0.75rem',
                fontSize: '0.78rem',
                background: 'rgba(147, 51, 234, 0.12)',
                borderColor: 'rgba(147, 51, 234, 0.35)',
                color: '#D8B4FE'
              }}
            >
              <Sparkles size={12} style={{ color: '#C084FC' }} />
              "{promptText}"
            </button>
          ))}
        </div>
      </div>

      {/* Spoken AI Feedback Bubble */}
      <div style={{
        background: 'rgba(5, 11, 23, 0.7)',
        border: '1px solid rgba(147, 51, 234, 0.35)',
        borderRadius: '10px',
        padding: '0.85rem 1rem',
        marginBottom: '1rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem'
      }}>
        <div style={{
          width: '32px',
          height: '32px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #9333EA, #00F0FF)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0
        }}>
          <Sparkles size={16} color="#050B17" />
        </div>
        <div>
          <div style={{ fontSize: '0.7rem', color: '#C084FC', fontWeight: '700', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>
            Neural Voice Engine Response
          </div>
          <div style={{ fontSize: '0.85rem', color: '#F8FAFC', fontStyle: 'italic', marginTop: '0.15rem' }}>
            "{lastResponse}"
          </div>
        </div>
      </div>

      {/* Custom Text Prompt Input (Fallback) */}
      <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '0.5rem' }}>
        <input
          type="text"
          placeholder="Speak using microphone above, or type command here (e.g., 'turn off', 'speed 5', 'sleep mode')..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          style={{
            flex: 1,
            background: 'rgba(5, 11, 23, 0.6)',
            border: '1px solid var(--border-cyan)',
            borderRadius: '8px',
            padding: '0.6rem 1rem',
            color: '#FFFFFF',
            fontSize: '0.85rem',
            fontFamily: 'var(--font-body)',
            outline: 'none'
          }}
        />
        <button
          type="submit"
          className="btn-cyber-primary"
          style={{ padding: '0.6rem 1.2rem', borderRadius: '8px' }}
        >
          <Send size={15} /> Send Command
        </button>
      </form>
    </div>
  );
}
