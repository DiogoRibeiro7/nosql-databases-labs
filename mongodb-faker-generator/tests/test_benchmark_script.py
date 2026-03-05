"""Tests for scripts/benchmark.py helpers."""

import os
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if ROOT not in sys.path:
    sys.path.append(ROOT)

from scripts import benchmark  # noqa: E402


def test_benchmark_function_single_iteration(monkeypatch):
    """benchmark_function should return expected keys with one iteration."""
    mem_values = iter([100.0, 105.0])
    time_values = iter([0.0, 1.0])

    monkeypatch.setattr(benchmark, "get_memory_usage", lambda: next(mem_values))

    def fake_time():
        return next(time_values)

    monkeypatch.setattr(benchmark.time, "time", fake_time)

    result = benchmark.benchmark_function(lambda: "ok", iterations=1)

    assert result["avg_time"] == 1.0
    assert result["std_time"] == 0
    assert result["avg_memory"] == 5.0
    assert result["min_time"] == 1.0
    assert result["max_time"] == 1.0
