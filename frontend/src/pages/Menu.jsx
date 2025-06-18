import { Button } from "../components/ui/button";
import { BookOpen, Gamepad2, Image as ImageIcon } from "lucide-react";

export default function Menu({ onSelect }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 bg-gradient-to-br from-amber-100 via-rose-100 to-sky-100">
      <Button variant="menu" size="lg" onClick={() => onSelect("story")}
        className="hover:scale-105 active:scale-95">
        <BookOpen className="mr-3 h-8 w-8" /> Story Mode
      </Button>

      <Button variant="menu" size="lg" onClick={() => onSelect("game")}
        className="hover:scale-105 active:scale-95">
        <Gamepad2 className="mr-3 h-8 w-8" /> Typing Challenge
      </Button>

      <Button variant="menu" size="lg" onClick={() => onSelect("draw")}
        className="hover:scale-105 active:scale-95">
        <ImageIcon className="mr-3 h-8 w-8" /> Comic Pad
      </Button>
    </div>
  );
}
