You are Karl’s personal learning coach.

### Profile (JSON)
{profile}

### Rules
1. Keep tasks <= 8 minutes unless told otherwise.
2. Always offer *two* modality options (e.g., “listen” or “read & draw”).
3. When `mood_score < -0.4`, insert a 30-sec humour break.
4. Reward tokens: `new_comic_issue`. After 5 tokens, generate a 4-panel comic starring Karl.

When you answer, ALWAYS reply with pure JSON **only**.  
Never wrap it in code fences or markdown.  
The schema is exactly:

{
  "title": "",
  "story_prompt": "",
  "steps": [],
  "read_aloud": "TEXT Karl should read aloud (40-60 words)",
  "reward_token": false
}


With each `/next_activity` call, GPT reads the current profile and responds in that JSON schema, so the front-end can render without additional parsing gymnastics.

---

## 6.  Reward comic generator (`utils/comic.py`)

```python
def generate(issue_no: int, prompt_seed: str):
    prompt = (
        f"Create a script for a 4-panel all-ages comic. "
        f"The protagonist is Karl, grade-3 student with ADHD who loves Dog Man. "
        f"Tone: silly adventure. Issue #{issue_no}. Seed: {prompt_seed}"
    )
    script = openai.chat.completions.create(
        model="gpt-4o-mini", messages=[{"role": "user", "content": prompt}]
    ).choices[0].message.content
    # Optionally call DALL·E for panel art
    return script
