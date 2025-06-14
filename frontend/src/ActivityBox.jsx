export default function ActivityBox({ data }) {
  if (!data) return null;

  const { title, story_prompt, steps, read_aloud, reward_token } = data;

  return (
    <div className="border p-4 rounded-xl shadow w-full max-w-xl">
      <h2 className="font-bold text-xl mb-2">{title}</h2>

      {story_prompt && <p className="mb-3">{story_prompt}</p>}

      {steps && steps.length > 0 && (
        <ol className="list-decimal pl-6 space-y-1 mb-3">
          {steps.map((s, i) => <li key={i}>{s}</li>)}
        </ol>
      )}

      {/* 🔑  NEW: show the passage Karl must read */}
      {read_aloud && (
        <blockquote className="italic bg-gray-50 p-3 border-l-4 mb-3">
          {read_aloud}
        </blockquote>
      )}

      {reward_token && (
        <p className="text-green-700 font-semibold">🎉 Reward unlocked!</p>
      )}
    </div>
  );
}
