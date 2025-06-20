import { useState } from "react";
import Home from "./pages/Home.jsx";
import Menu from "./pages/Menu.jsx";
import StoryMode from "./pages/StoryMode.jsx";
import TypingChallenge from "./pages/TypingChallenge.jsx";
import Accomplishments from "./pages/Accomplishments.jsx";

export default function App() {
  const [stage, setStage] = useState("home");

  if (stage === "home") return <Home onStart={() => setStage("menu")} />;
  if (stage === "menu") return <Menu onSelect={(mode) => setStage(mode)} />;
  if (stage === "story") return <StoryMode onBack={() => setStage("menu")} />;
  if (stage === "game") return <TypingChallenge onBack={() => setStage("menu")} />;
  if (stage === "accomplishments") return <Accomplishments onBack={() => setStage("menu")} />;

  return null;
}
