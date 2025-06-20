import { useState } from "react";
import { User, ArrowLeft, BookOpen, Keyboard, Award, Home } from "lucide-react";
import HomePage from "./pages/Home.jsx";
import Menu from "./pages/Menu.jsx";
import StoryMode from "./pages/StoryMode.jsx";
import TypingChallenge from "./pages/TypingChallenge.jsx";
import Accomplishments from "./pages/Accomplishments.jsx";

export default function App() {
  const [stage, setStage] = useState("home");

  const getPageTitle = () => {
    switch (stage) {
      case "home": return "Karl's Adventure";
      case "menu": return "Adventure Menu";
      case "story": return "Story Mode";
      case "game": return "Typing Challenge";
      case "accomplishments": return "Accomplishments";
      default: return "Karl's Adventure";
    }
  };

  const getNavItems = () => {
    if (stage === "home") return [];
    
    const items = [
      { id: "menu", label: "Menu", icon: Home, active: stage === "menu" }
    ];

    if (stage !== "menu") {
      const pageItems = {
        story: { label: "Story Mode", icon: BookOpen },
        game: { label: "Typing Challenge", icon: Keyboard },
        accomplishments: { label: "Accomplishments", icon: Award }
      };
      
      if (pageItems[stage]) {
        items.push({
          id: stage,
          label: pageItems[stage].label,
          icon: pageItems[stage].icon,
          active: true
        });
      }
    }

    return items;
  };

  const showNavigation = stage !== "home";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Professional Navigation Header */}
      {showNavigation && (
        <nav className="bg-white shadow-sm border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center">
                <BookOpen className="h-8 w-8 text-blue-600 mr-3" />
                <h1 className="text-xl font-semibold text-slate-900">{getPageTitle()}</h1>
              </div>
              <div className="flex items-center space-x-4">
                <nav className="flex space-x-4">
                  {getNavItems().map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setStage(item.id)}
                      className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        item.active 
                          ? 'bg-blue-100 text-blue-700' 
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                      }`}
                    >
                      <item.icon className="h-4 w-4 mr-2" />
                      {item.label}
                    </button>
                  ))}
                </nav>
                <div className="flex items-center space-x-2 border-l border-slate-200 pl-4">
                  <User className="h-5 w-5 text-slate-400" />
                  <span className="text-sm text-slate-700 font-medium">Karl</span>
                </div>
              </div>
            </div>
          </div>
        </nav>
      )}

      {/* Main Content */}
      <main className={showNavigation ? "max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8" : ""}>
        {stage === "home" && <HomePage onStart={() => setStage("menu")} />}
        {stage === "menu" && <Menu onSelect={(mode) => setStage(mode)} onBack={() => setStage("home")} />}
        {stage === "story" && <StoryMode onBack={() => setStage("menu")} />}
        {stage === "game" && <TypingChallenge onBack={() => setStage("menu")} />}
        {stage === "accomplishments" && <Accomplishments onBack={() => setStage("menu")} />}
      </main>
    </div>
  );
}