// Apna camera aur microphone on/off karne ka logic.
// Camera aur mic alag-alag start aur stop hote hain.
// Off karte waqt tracks .stop() karte hain, taaki camera ki light bhi band ho jaye.
// Phase 8 mein yahi streams WebRTC se teammates ko bheji jayengi.

import { useCallback, useEffect, useRef, useState } from "react";

// Browser ke error ko aasan message mein badalta hai
function describeError(error, device) {
  switch (error.name) {
    case "NotAllowedError":
    case "SecurityError":
      return `Permission denied. Allow the ${device} in your browser's address bar, then try again.`;
    case "NotFoundError":
    case "OverconstrainedError":
      return `No ${device} was found on this device.`;
    case "NotReadableError":
      return `The ${device} is being used by another app. Close that app and try again.`;
    default:
      return `Could not start the ${device}. Please try again.`;
  }
}

const NOT_SUPPORTED =
  "This browser cannot use the camera or microphone here. Use Chrome or Edge on localhost or HTTPS.";

function useLocalMedia() {
  const [micOn, setMicOn] = useState(false);
  const [cameraOn, setCameraOn] = useState(false);
  const [videoStream, setVideoStream] = useState(null);
  const [micLevel, setMicLevel] = useState(0); // 0 se 100
  const [error, setError] = useState("");

  // Refs: inme stream aur audio ki cheezein rakhte hain (inke badalne par re-render nahi chahiye)
  const audioStreamRef = useRef(null);
  const videoStreamRef = useRef(null);
  const audioContextRef = useRef(null);
  const frameRef = useRef(null);

  // Mic ko poori tarah band karna
  const releaseMic = useCallback(() => {
    if (frameRef.current) cancelAnimationFrame(frameRef.current);
    frameRef.current = null;

    if (audioStreamRef.current) {
      audioStreamRef.current.getTracks().forEach((track) => track.stop());
    }
    audioStreamRef.current = null;

    if (audioContextRef.current) audioContextRef.current.close();
    audioContextRef.current = null;
  }, []);

  // Camera ko poori tarah band karna
  const releaseCamera = useCallback(() => {
    if (videoStreamRef.current) {
      videoStreamRef.current.getTracks().forEach((track) => track.stop());
    }
    videoStreamRef.current = null;
  }, []);

  // Page chhodne par camera aur mic band ho jayein
  useEffect(() => {
    return () => {
      releaseMic();
      releaseCamera();
    };
  }, [releaseMic, releaseCamera]);

  const startMic = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioStreamRef.current = stream;

      // Awaaz kitni tez hai, ye naapne ke liye AudioContext
      const AudioContextClass =
        window.AudioContext || window.webkitAudioContext;
      const context = new AudioContextClass();
      audioContextRef.current = context;

      const analyser = context.createAnalyser();
      analyser.fftSize = 512;
      context.createMediaStreamSource(stream).connect(analyser);

      const data = new Uint8Array(analyser.fftSize);
      let lastUpdate = 0;

      const measure = (time) => {
        analyser.getByteTimeDomainData(data);

        // RMS: awaaz ki average taaqat
        let sum = 0;
        for (let i = 0; i < data.length; i++) {
          const value = (data[i] - 128) / 128;
          sum += value * value;
        }
        const rms = Math.sqrt(sum / data.length);

        // Har 100ms mein hi screen update karte hain (har frame par nahi)
        if (time - lastUpdate > 100) {
          setMicLevel(Math.min(100, Math.round(rms * 300)));
          lastUpdate = time;
        }
        frameRef.current = requestAnimationFrame(measure);
      };

      frameRef.current = requestAnimationFrame(measure);
      setMicOn(true);
      setError("");
    } catch (err) {
      releaseMic();
      setError(describeError(err, "microphone"));
    }
  };

  const toggleMic = () => {
    if (micOn) {
      releaseMic();
      setMicLevel(0);
      setMicOn(false);
      return;
    }
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setError(NOT_SUPPORTED);
      return;
    }
    startMic();
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      videoStreamRef.current = stream;
      setVideoStream(stream);
      setCameraOn(true);
      setError("");
    } catch (err) {
      releaseCamera();
      setError(describeError(err, "camera"));
    }
  };

  const toggleCamera = () => {
    if (cameraOn) {
      releaseCamera();
      setVideoStream(null);
      setCameraOn(false);
      return;
    }
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setError(NOT_SUPPORTED);
      return;
    }
    startCamera();
  };

  return {
    micOn,
    cameraOn,
    videoStream,
    micLevel,
    error,
    toggleMic,
    toggleCamera,
  };
}

export default useLocalMedia;
