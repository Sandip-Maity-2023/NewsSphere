

import React, { useState, useEffect, useRef } from "react";
import happy from "../assets/happy.png";
import sad from "../assets/sad.png";
import neutral from "../assets/neutral.png";
import mouthOpen from "../assets/open.png";

import { getSpokenNewsSummary } from "./Gemini";

export default function Anchor({ newsText = "" }) {

  const [mood, setMood] = useState("neutral");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [aiText, setAiText] = useState("");

  const synth = window.speechSynthesis;

  const analyzeSentiment = (text) => {
    if (!text) return "neutral";

    const happyWords = ["good", "great", "win", "happy", "success", "growth"];
    const sadWords = ["bad", "crime", "died", "loss", "fail", "attack"];

    const lower = text.toLowerCase();
    let score = 0;

    happyWords.forEach((w) => lower.includes(w) && (score += 1));
    sadWords.forEach((w) => lower.includes(w) && (score -= 1));

    if (score > 0) return "happy";
    if (score < 0) return "sad";
    return "neutral";
  };

  // -------------------------
  // SPEAK FUNCTION (FIXED)
  // -------------------------
  const speak = async () => {
    try {
      if (!newsText) return;

      // 1️⃣ Stop any current speech
      synth.cancel();

      // 2️⃣ Get Gemini's transformed speech text
      const generated = await getSpokenNewsSummary(newsText);
      setAiText(generated);

      // 3️⃣ Detect emotional tone
      setMood(analyzeSentiment(generated));

      // 4️⃣ Create utterance
      const utter = new SpeechSynthesisUtterance(generated); //interface of the web speech API represents a speech request
      utter.lang = "en-US";   // Set language

      //handle speech events
      utter.onstart = () => {
        console.log("Speech started");
        setIsSpeaking(true);
      };

      utter.onend = () => {
        console.log("Speech ended");
        setIsSpeaking(false);
      };

      // 5️⃣ MUST: Wait a moment so Chrome doesn’t block speech
      setTimeout(() => {
        synth.speak(utter);
      }, 200);

    } catch (error) {
      console.error("Speak error:", error);
    }
  };

  // -------------------------
  // LIP SYNC
  // -------------------------
  useEffect(() => {
    let interval;
    if (isSpeaking) {
      interval = setInterval(() => {
        setIsSpeaking((prev) => !prev);
      }, 180);
    }
    return () => clearInterval(interval);
  }, [isSpeaking]);

  const getImage = () => {
    if (isSpeaking) return mouthOpen;
    if (mood === "happy") return happy;
    if (mood === "sad") return sad;
    return neutral;
  };

  return (
    <div style={{ textAlign: "center", marginTop: 20 }}>
      <img
        src={getImage()}
        width="650"
        style={{ borderRadius: "12px", transition: "0.1s" }}
      />

      <button
        onClick={speak}
        style={{
          marginTop: 10,
          padding: "10px 18px",
          background: "#0b74ff",
          color: "white",
          border: "none",
          borderRadius: 10,
          cursor: "pointer",
          fontWeight: "500",
        }}
      >
        🎤 Speak News
      </button>

      {aiText && (
        <p style={{ marginTop: 10, fontSize: "16px", opacity: 0.7 }}>{aiText}</p>
      )}
    </div>
  );
}

