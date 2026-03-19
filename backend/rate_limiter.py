"""In-memory sliding window rate limiter."""

import time
from collections import defaultdict
from typing import Dict, List


class RateLimiter:
    """
    Sliding window rate limiter.
    Allows `max_requests` per `window_seconds` per user.
    """

    def __init__(self, max_requests: int = 10, window_seconds: int = 3600):
        self.max_requests = max_requests
        self.window_seconds = window_seconds
        self._requests: Dict[str, List[float]] = defaultdict(list)

    def is_allowed(self, user_id: str) -> bool:
        """Check if user is allowed to make another request."""
        now = time.time()
        cutoff = now - self.window_seconds

        # Remove expired timestamps
        self._requests[user_id] = [
            ts for ts in self._requests[user_id] if ts > cutoff
        ]

        if len(self._requests[user_id]) >= self.max_requests:
            return False

        self._requests[user_id].append(now)
        return True

    def remaining(self, user_id: str) -> int:
        """Return the number of remaining requests in the current window."""
        now = time.time()
        cutoff = now - self.window_seconds
        self._requests[user_id] = [
            ts for ts in self._requests[user_id] if ts > cutoff
        ]
        return max(0, self.max_requests - len(self._requests[user_id]))

    def reset_time(self, user_id: str) -> float:
        """Return the seconds until the oldest request in the window expires."""
        now = time.time()
        cutoff = now - self.window_seconds
        self._requests[user_id] = [
            ts for ts in self._requests[user_id] if ts > cutoff
        ]
        if not self._requests[user_id]:
            return 0.0
        oldest = min(self._requests[user_id])
        return max(0.0, (oldest + self.window_seconds) - now)


# Global rate limiter instance
redteam_limiter = RateLimiter(max_requests=10, window_seconds=3600)
