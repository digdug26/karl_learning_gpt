import { useState } from "react";
import Home from "./pages/Home";
import Menu from "./pages/Menu";
import StoryMode from "./pages/StoryMode";

export default function App() {
  const [stage, setStage] = useState("home");

  if (stage === "home") return <Home onStart={() => setStage("menu")} />;
  if (stage === "menu") return <Menu onSelect={(mode) => setStage(mode)} />;
  if (stage === "story") return <StoryMode />;

  return null;
}
