#!/usr/bin/env python3
"""
Performance benchmark script for data generation
"""

import time
import psutil
import os
import sys
from statistics import mean, stdev

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from python.generate_fake_data import (
    generate_users,
    generate_products,
    generate_transactions,
    generate_logs,
)


def get_memory_usage():
    """Get current memory usage in MB"""
    process = psutil.Process(os.getpid())
    return process.memory_info().rss / 1024 / 1024


def benchmark_function(func, *args, iterations=5):
    """Benchmark a function multiple times"""
    times = []
    memory_usages = []

    for i in range(iterations):
        start_memory = get_memory_usage()
        start_time = time.time()

        result = func(*args)

        end_time = time.time()
        end_memory = get_memory_usage()

        times.append(end_time - start_time)
        memory_usages.append(end_memory - start_memory)

    return {
        "avg_time": mean(times),
        "std_time": stdev(times) if len(times) > 1 else 0,
        "avg_memory": mean(memory_usages),
        "min_time": min(times),
        "max_time": max(times),
    }


def main():
    """Run performance benchmarks"""
    print("🚀 MongoDB Faker Generator - Performance Benchmark\n")
    print(
        f"System: {psutil.cpu_count()} CPUs, {psutil.virtual_memory().total / 1024**3:.1f} GB RAM"
    )
    print(f"Python: {sys.version.split()[0]}\n")

    benchmarks = [
        ("Generate 100 users", generate_users, 100),
        ("Generate 1000 users", generate_users, 1000),
        ("Generate 500 products", generate_products, 500),
        ("Generate 5000 products", generate_products, 5000),
    ]

    results = []

    for name, func, count in benchmarks:
        print(f"⏱️  Benchmarking: {name}")
        stats = benchmark_function(func, count)

        print(f"   Average time: {stats['avg_time']:.3f}s ± {stats['std_time']:.3f}s")
        print(f"   Memory usage: {stats['avg_memory']:.1f} MB")
        print(f"   Records/sec: {count / stats['avg_time']:.0f}\n")

        results.append({"operation": name, "count": count, **stats})

    # Complex operations
    print("⏱️  Benchmarking: Generate full dataset")
    start_time = time.time()
    start_memory = get_memory_usage()

    # Generate the entire dataset to highlight combined memory/time usage.
    users = generate_users(100)
    products = generate_products(500)
    transactions = generate_transactions(users, products, 1000)
    logs = generate_logs(users, 5000)

    total_time = time.time() - start_time
    total_memory = get_memory_usage() - start_memory

    print(f"   Total time: {total_time:.2f}s")
    print(f"   Total memory: {total_memory:.1f} MB")
    print(
        f"   Total records: {len(users) + len(products) + len(transactions) + len(logs)}"
    )

    # Save results
    with open("benchmark_results.txt", "w") as f:
        f.write("MongoDB Faker Generator - Benchmark Results\n")
        f.write("=" * 50 + "\n\n")

        for result in results:
            f.write(f"{result['operation']}:\n")
            f.write(f"  Count: {result['count']}\n")
            f.write(f"  Avg Time: {result['avg_time']:.3f}s\n")
            f.write(f"  Memory: {result['avg_memory']:.1f} MB\n")
            f.write(
                f"  Rate: {result['count'] / result['avg_time']:.0f} records/sec\n\n"
            )

    print("\n✅ Benchmark complete! Results saved to benchmark_results.txt")


if __name__ == "__main__":
    main()
