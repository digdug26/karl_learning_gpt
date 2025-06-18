import { useState } from "react";
import Home from "./pages/Home.jsx";
import Menu from "./pages/Menu.jsx";
import StoryMode from "./pages/StoryMode.jsx";

export default function App() {
  const [stage, setStage] = useState("home");

  if (stage === "home") return <Home onStart={() => setStage("menu")} />;
  if (stage === "menu") return <Menu onSelect={(mode) => setStage(mode)} />;
  if (stage === "story") return <StoryMode />;

  return null;
}
