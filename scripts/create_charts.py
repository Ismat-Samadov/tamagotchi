#!/usr/bin/env python3
"""
Coffee Shop Data Visualization Script
Generates business-focused charts for presentation
"""

import csv
import os
from collections import defaultdict, Counter
import matplotlib.pyplot as plt
import matplotlib.patches as mpatches
import seaborn as sns
import numpy as np

# Set style
plt.style.use('seaborn-v0_8-darkgrid')
sns.set_palette("husl")

# Output directory
CHARTS_DIR = os.path.join(os.path.dirname(__file__), "..", "charts")
os.makedirs(CHARTS_DIR, exist_ok=True)

# Read data
DATA_FILE = os.path.join(os.path.dirname(__file__), "..", "data", "coffeeshops.csv")

def load_data():
    """Load coffee shop data from CSV"""
    with open(DATA_FILE, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        return list(reader)


def chart1_market_share(shops):
    """Chart 1: Market Share by Coffee Chain"""
    chain_counts = Counter(s['chain_name'] for s in shops)

    # Get top 8 chains, group rest as "Others"
    top_chains = chain_counts.most_common(8)
    others_count = sum(count for chain, count in chain_counts.items()
                      if chain not in dict(top_chains))

    labels = [chain for chain, _ in top_chains]
    sizes = [count for _, count in top_chains]

    if others_count > 0:
        labels.append('Others')
        sizes.append(others_count)

    # Create pie chart
    fig, ax = plt.subplots(figsize=(12, 8))
    colors = sns.color_palette("husl", len(labels))

    wedges, texts, autotexts = ax.pie(sizes, labels=labels, autopct='%1.1f%%',
                                        startangle=90, colors=colors,
                                        textprops={'fontsize': 11, 'weight': 'bold'})

    # Enhance text
    for autotext in autotexts:
        autotext.set_color('white')
        autotext.set_fontsize(10)

    ax.set_title('Coffee Shop Market Share in Baku\nBy Number of Locations',
                 fontsize=16, weight='bold', pad=20)

    plt.tight_layout()
    plt.savefig(os.path.join(CHARTS_DIR, '1_market_share.png'), dpi=300, bbox_inches='tight')
    plt.close()
    print("✓ Generated: 1_market_share.png")


def chart2_top_chains_locations(shops):
    """Chart 2: Top 10 Chains by Number of Locations"""
    chain_counts = Counter(s['chain_name'] for s in shops)
    top_10 = chain_counts.most_common(10)

    chains = [chain for chain, _ in top_10]
    counts = [count for _, count in top_10]

    fig, ax = plt.subplots(figsize=(12, 8))
    bars = ax.barh(chains, counts, color=sns.color_palette("rocket", len(chains)))

    # Add value labels
    for i, (bar, count) in enumerate(zip(bars, counts)):
        ax.text(count + 0.3, bar.get_y() + bar.get_height()/2,
                str(count), va='center', fontsize=11, weight='bold')

    ax.set_xlabel('Number of Locations', fontsize=12, weight='bold')
    ax.set_title('Top 10 Coffee Chains by Location Count',
                 fontsize=16, weight='bold', pad=20)
    ax.invert_yaxis()

    plt.tight_layout()
    plt.savefig(os.path.join(CHARTS_DIR, '2_top_chains_locations.png'), dpi=300, bbox_inches='tight')
    plt.close()
    print("✓ Generated: 2_top_chains_locations.png")


def chart3_average_ratings(shops):
    """Chart 3: Average Rating by Chain (3+ locations)"""
    chain_ratings = defaultdict(list)
    for shop in shops:
        if shop['rating'] != 'N/A':
            chain_ratings[shop['chain_name']].append(float(shop['rating']))

    # Filter chains with 3+ locations
    avg_ratings = []
    for chain, ratings in chain_ratings.items():
        if len(ratings) >= 3:
            avg_rating = sum(ratings) / len(ratings)
            avg_ratings.append((chain, avg_rating, len(ratings)))

    # Sort by rating
    avg_ratings.sort(key=lambda x: x[1], reverse=True)
    top_10 = avg_ratings[:10]

    chains = [chain for chain, _, _ in top_10]
    ratings = [rating for _, rating, _ in top_10]
    counts = [count for _, _, count in top_10]

    fig, ax = plt.subplots(figsize=(12, 8))

    # Color bars by rating (green = high, yellow = medium, red = low)
    colors = ['#2ecc71' if r >= 4.5 else '#f39c12' if r >= 4.0 else '#e74c3c'
              for r in ratings]

    bars = ax.barh(chains, ratings, color=colors)

    # Add value labels with location count
    for i, (bar, rating, count) in enumerate(zip(bars, ratings, counts)):
        ax.text(rating + 0.02, bar.get_y() + bar.get_height()/2,
                f'{rating:.2f} ({count} locations)',
                va='center', fontsize=10, weight='bold')

    ax.set_xlabel('Average Rating (out of 5)', fontsize=12, weight='bold')
    ax.set_title('Average Customer Rating by Coffee Chain\n(Chains with 3+ Locations)',
                 fontsize=16, weight='bold', pad=20)
    ax.set_xlim(0, 5.2)
    ax.invert_yaxis()

    # Add legend
    green_patch = mpatches.Patch(color='#2ecc71', label='Excellent (4.5+)')
    yellow_patch = mpatches.Patch(color='#f39c12', label='Good (4.0-4.5)')
    red_patch = mpatches.Patch(color='#e74c3c', label='Average (<4.0)')
    ax.legend(handles=[green_patch, yellow_patch, red_patch], loc='lower right')

    plt.tight_layout()
    plt.savefig(os.path.join(CHARTS_DIR, '3_average_ratings.png'), dpi=300, bbox_inches='tight')
    plt.close()
    print("✓ Generated: 3_average_ratings.png")


def chart4_rating_distribution(shops):
    """Chart 4: Overall Rating Distribution"""
    ratings = [float(s['rating']) for s in shops if s['rating'] != 'N/A']

    fig, ax = plt.subplots(figsize=(12, 7))

    n, bins, patches = ax.hist(ratings, bins=20, edgecolor='black', alpha=0.7)

    # Color bars by rating
    for i, patch in enumerate(patches):
        rating_val = (bins[i] + bins[i+1]) / 2
        if rating_val >= 4.5:
            patch.set_facecolor('#2ecc71')
        elif rating_val >= 4.0:
            patch.set_facecolor('#f39c12')
        elif rating_val >= 3.5:
            patch.set_facecolor('#e67e22')
        else:
            patch.set_facecolor('#e74c3c')

    ax.axvline(np.mean(ratings), color='red', linestyle='--', linewidth=2,
               label=f'Mean: {np.mean(ratings):.2f}')
    ax.axvline(np.median(ratings), color='blue', linestyle='--', linewidth=2,
               label=f'Median: {np.median(ratings):.2f}')

    ax.set_xlabel('Rating (out of 5)', fontsize=12, weight='bold')
    ax.set_ylabel('Number of Coffee Shops', fontsize=12, weight='bold')
    ax.set_title('Distribution of Coffee Shop Ratings in Baku',
                 fontsize=16, weight='bold', pad=20)
    ax.legend(fontsize=11)

    # Add statistics text
    stats_text = f'Total Shops: {len(ratings)}\nAvg Rating: {np.mean(ratings):.2f}\nStd Dev: {np.std(ratings):.2f}'
    ax.text(0.02, 0.98, stats_text, transform=ax.transAxes,
            fontsize=11, verticalalignment='top',
            bbox=dict(boxstyle='round', facecolor='wheat', alpha=0.5))

    plt.tight_layout()
    plt.savefig(os.path.join(CHARTS_DIR, '4_rating_distribution.png'), dpi=300, bbox_inches='tight')
    plt.close()
    print("✓ Generated: 4_rating_distribution.png")


def chart5_geographic_distribution(shops):
    """Chart 5: Geographic Distribution of Coffee Shops in Baku"""
    # Extract coordinates
    lats = []
    lons = []
    for shop in shops:
        if shop['latitude'] != 'N/A' and shop['longitude'] != 'N/A':
            lats.append(float(shop['latitude']))
            lons.append(float(shop['longitude']))

    fig, ax = plt.subplots(figsize=(14, 10))

    # Create scatter plot
    scatter = ax.scatter(lons, lats, c=lats, s=100, alpha=0.6,
                        cmap='YlOrRd', edgecolors='black', linewidth=0.5)

    ax.set_xlabel('Longitude', fontsize=12, weight='bold')
    ax.set_ylabel('Latitude', fontsize=12, weight='bold')
    ax.set_title('Geographic Distribution of Coffee Shops in Baku',
                 fontsize=16, weight='bold', pad=20)

    # Add colorbar
    cbar = plt.colorbar(scatter, ax=ax)
    cbar.set_label('Latitude', fontsize=11, weight='bold')

    # Add grid
    ax.grid(True, alpha=0.3)

    # Add statistics
    stats_text = f'Total Locations: {len(lats)}\nArea Coverage:\nLat: {min(lats):.3f} to {max(lats):.3f}\nLon: {min(lons):.3f} to {max(lons):.3f}'
    ax.text(0.02, 0.98, stats_text, transform=ax.transAxes,
            fontsize=10, verticalalignment='top',
            bbox=dict(boxstyle='round', facecolor='lightblue', alpha=0.7))

    plt.tight_layout()
    plt.savefig(os.path.join(CHARTS_DIR, '5_geographic_distribution.png'), dpi=300, bbox_inches='tight')
    plt.close()
    print("✓ Generated: 5_geographic_distribution.png")


def chart6_review_volume_vs_rating(shops):
    """Chart 6: Review Volume vs Rating Analysis"""
    # Filter shops with reviews and ratings
    data = []
    for shop in shops:
        if shop['total_ratings'] != 'N/A' and shop['rating'] != 'N/A':
            reviews = int(shop['total_ratings'])
            rating = float(shop['rating'])
            chain = shop['chain_name']
            data.append((reviews, rating, chain))

    # Separate by review volume
    high_volume = [d for d in data if d[0] >= 100]
    low_volume = [d for d in data if d[0] < 100]

    fig, ax = plt.subplots(figsize=(14, 8))

    # Plot
    if high_volume:
        reviews_high, ratings_high, _ = zip(*high_volume)
        ax.scatter(reviews_high, ratings_high, s=100, alpha=0.6,
                  c='#e74c3c', label='High Volume (100+ reviews)',
                  edgecolors='black', linewidth=0.5)

    if low_volume:
        reviews_low, ratings_low, _ = zip(*low_volume)
        ax.scatter(reviews_low, ratings_low, s=100, alpha=0.6,
                  c='#3498db', label='Low Volume (<100 reviews)',
                  edgecolors='black', linewidth=0.5)

    ax.set_xlabel('Number of Reviews', fontsize=12, weight='bold')
    ax.set_ylabel('Average Rating (out of 5)', fontsize=12, weight='bold')
    ax.set_title('Customer Engagement vs. Satisfaction\nReview Volume vs. Rating',
                 fontsize=16, weight='bold', pad=20)
    ax.legend(fontsize=11)
    ax.grid(True, alpha=0.3)

    # Add trend line
    all_reviews = [d[0] for d in data]
    all_ratings = [d[1] for d in data]
    z = np.polyfit(all_reviews, all_ratings, 1)
    p = np.poly1d(z)
    ax.plot(sorted(all_reviews), p(sorted(all_reviews)), "r--",
            linewidth=2, label=f'Trend: y={z[0]:.6f}x+{z[1]:.2f}', alpha=0.7)

    plt.tight_layout()
    plt.savefig(os.path.join(CHARTS_DIR, '6_review_volume_vs_rating.png'), dpi=300, bbox_inches='tight')
    plt.close()
    print("✓ Generated: 6_review_volume_vs_rating.png")


def chart7_top_performers(shops):
    """Chart 7: Top Performing Coffee Shops (Rating x Review Volume)"""
    # Calculate performance score
    performers = []
    for shop in shops:
        if shop['total_ratings'] != 'N/A' and shop['rating'] != 'N/A':
            reviews = int(shop['total_ratings'])
            rating = float(shop['rating'])
            # Performance score = rating * log(reviews + 1)
            score = rating * np.log(reviews + 1)
            performers.append((shop['name'], shop['chain_name'], rating, reviews, score))

    # Sort by score
    performers.sort(key=lambda x: x[4], reverse=True)
    top_15 = performers[:15]

    names = [f"{p[0][:30]}..." if len(p[0]) > 30 else p[0] for p in top_15]
    scores = [p[4] for p in top_15]
    ratings = [p[2] for p in top_15]

    fig, ax = plt.subplots(figsize=(12, 10))

    # Color by rating
    colors = ['#2ecc71' if r >= 4.5 else '#f39c12' if r >= 4.0 else '#e67e22'
              for r in ratings]

    bars = ax.barh(names, scores, color=colors)

    # Add value labels
    for i, (bar, score, rating, review) in enumerate(zip(bars, scores,
                                                          [p[2] for p in top_15],
                                                          [p[3] for p in top_15])):
        ax.text(score + 0.5, bar.get_y() + bar.get_height()/2,
                f'{rating:.1f}★ ({review} reviews)',
                va='center', fontsize=9, weight='bold')

    ax.set_xlabel('Performance Score (Rating × log(Reviews))', fontsize=12, weight='bold')
    ax.set_title('Top 15 Performing Coffee Shops in Baku\nBased on Rating and Review Volume',
                 fontsize=16, weight='bold', pad=20)
    ax.invert_yaxis()

    plt.tight_layout()
    plt.savefig(os.path.join(CHARTS_DIR, '7_top_performers.png'), dpi=300, bbox_inches='tight')
    plt.close()
    print("✓ Generated: 7_top_performers.png")


def main():
    """Generate all charts"""
    print("=" * 60)
    print("Coffee Shop Data Visualization")
    print("=" * 60)
    print()

    # Load data
    print("Loading data...")
    shops = load_data()
    print(f"Loaded {len(shops)} coffee shops\n")

    # Generate charts
    print("Generating charts...")
    chart1_market_share(shops)
    chart2_top_chains_locations(shops)
    chart3_average_ratings(shops)
    chart4_rating_distribution(shops)
    chart5_geographic_distribution(shops)
    chart6_review_volume_vs_rating(shops)
    chart7_top_performers(shops)

    print()
    print("=" * 60)
    print(f"All charts saved to: {CHARTS_DIR}")
    print("=" * 60)


if __name__ == "__main__":
    main()
