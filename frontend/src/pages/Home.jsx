import { Button } from "../components/ui/button";
import { useSpring, animated } from "@react-spring/web";

export default function Home({ onStart }) {
  const springProps = useSpring({
    from: { transform: "scale(0)" },
    to: { transform: "scale(1)" },
    config: { tension: 400, friction: 20 },
  });

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-sky-100 via-blue-100 to-grass-100">
      <animated.div style={springProps}>
        <Button
          variant="menu"
          size="xl"
          onClick={onStart}
          className="rounded-2xl shadow-2xl hover:scale-105 active:scale-95 focus-visible:outline-dashed focus-visible:outline-4 focus-visible:outline-amber-500"
        >
          Start Karl’s Adventure!
        </Button>
      </animated.div>
    </div>
  );
}
