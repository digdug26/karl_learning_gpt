from typing import Dict, List

from models.profile_v2 import LearnerProfile


def evaluate_badges(profile: LearnerProfile, session_metrics: Dict) -> List[str]:
    """Append new badges to profile.history.badges based on session metrics."""
    earned: List[str] = []

    history = profile.history

    # Update overall session count
    history.sessions_completed += 1

    # Track progress counters stored on the history object
    history.bookworm_progress = getattr(history, "bookworm_progress", 0)
    history.puzzle_progress = getattr(history, "puzzle_progress", 0)

    comprehension = session_metrics.get("comprehension", 0)
    if comprehension >= 70:
        history.bookworm_progress += 1
        if history.bookworm_progress % 5 == 0:
            history.badges.append("Bookworm Lv1")
            earned.append("Bookworm Lv1")

    problem_score = session_metrics.get("problem_solving_score", 0)
    if problem_score >= 80:
        history.puzzle_progress += 1
        if history.puzzle_progress % 3 == 0:
            history.badges.append("Puzzle Solver")
            earned.append("Puzzle Solver")

    keys_pct = session_metrics.get("keys_mastered_pct", 0)
    if keys_pct >= 30 and "Home-Row Hero" not in history.badges:
        history.badges.append("Home-Row Hero")
        earned.append("Home-Row Hero")

    return earned
