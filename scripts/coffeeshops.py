#!/usr/bin/env python3
"""
Coffee Shop Data Scraper for Baku
Scrapes coffee shop data from Google Places API (New) and saves to CSV
"""

import requests
import csv
import os
import time
from typing import List, Dict, Optional
from datetime import datetime
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Google Places API (New) endpoints
PLACES_SEARCH_URL = "https://places.googleapis.com/v1/places:searchText"
PLACE_DETAILS_URL = "https://places.googleapis.com/v1/places/{place_id}"

# Your Google API Key (get from https://console.cloud.google.com/apis/credentials)
API_KEY = os.getenv("GOOGLE_PLACES_API_KEY")

# Baku coordinates for location bias
BAKU_CENTER = {
    "latitude": 40.4093,
    "longitude": 49.8671
}

# Coffee chains to search for in Baku
COFFEE_CHAINS = [
    "Second Cup",
    "Starbucks",
    "Gloria Jeans Coffee",
    "Costa Coffee",
    "Coffeedelia",
    "Coffeemania",
    "Coffee Moffie",
    "Segafredo",
    "Coffee Way",
    "Coffee Lab",
    "Cafe City",
    "Traveler's Coffee",
    "Moka Roastery",
    "Urban Coffee",
    "Cozy Coffee",
    "United Coffee Beans",
    "Coffee Nero",
    "Coffee Crow",
    "Coffee Lea",
    "Beast Coffee",
]


def search_places(query: str) -> List[Dict]:
    """
    Search for places using Google Places API (New) Text Search

    Args:
        query: Search query (e.g., "Starbucks")

    Returns:
        List of place results
    """
    headers = {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": API_KEY,
        "X-Goog-FieldMask": "places.id,places.displayName,places.formattedAddress,places.location,places.rating,places.userRatingCount,places.priceLevel,places.businessStatus,places.types,places.nationalPhoneNumber,places.websiteUri,places.googleMapsUri,places.regularOpeningHours"
    }

    payload = {
        "textQuery": f"{query} Baku Azerbaijan",
        "languageCode": "en",
        "locationBias": {
            "circle": {
                "center": BAKU_CENTER,
                "radius": 25000.0  # 25km radius around Baku center
            }
        }
    }

    all_results = []

    try:
        response = requests.post(PLACES_SEARCH_URL, headers=headers, json=payload)
        response.raise_for_status()
        data = response.json()

        places = data.get("places", [])
        all_results.extend(places)

        # Note: New API handles pagination differently (via pageToken)
        # For now, we'll get the first page of results

    except requests.exceptions.RequestException as e:
        print(f"Request error for '{query}': {e}")
        if hasattr(e.response, 'text'):
            print(f"Response: {e.response.text}")

    return all_results


def format_opening_hours(regular_opening_hours: Optional[Dict]) -> str:
    """Format opening hours into a readable string"""
    if not regular_opening_hours:
        return "N/A"

    weekday_descriptions = regular_opening_hours.get("weekdayDescriptions", [])
    return " | ".join(weekday_descriptions) if weekday_descriptions else "N/A"


def is_in_azerbaijan(address: str, latitude: float, longitude: float) -> bool:
    """
    Check if a location is in Azerbaijan/Baku

    Args:
        address: Formatted address string
        latitude: Latitude coordinate
        longitude: Longitude coordinate

    Returns:
        True if location is in Azerbaijan, False otherwise
    """
    # Check address contains Azerbaijan/Baku keywords
    if address and address != "N/A":
        address_lower = address.lower()
        if any(keyword in address_lower for keyword in ["azerbaijan", "azərbaycan", "bakı", "baku", ", az"]):
            return True

    # Check coordinates are within Azerbaijan bounds
    # Azerbaijan approximate bounds: 38.4°N to 41.9°N, 44.8°E to 50.4°E
    # Baku area: 40.3°N to 40.5°N, 49.7°E to 50.0°E
    if latitude != "N/A" and longitude != "N/A":
        if 38.0 <= latitude <= 42.0 and 44.0 <= longitude <= 51.0:
            return True

    return False


def is_coffee_shop(place_types: list, name: str) -> bool:
    """
    Check if a location is actually a coffee shop

    Args:
        place_types: List of Google Place types
        name: Place name

    Returns:
        True if it's a coffee shop, False otherwise
    """
    # Exclude these types
    excluded_types = [
        "supermarket", "grocery_or_supermarket", "department_store",
        "shopping_mall", "restaurant", "bar", "pub", "night_club",
        "lodging", "hotel", "bakery", "meal_takeaway", "gym",
        "stadium", "parking", "car_dealer", "school"
    ]

    # Check if any excluded type is present
    if any(excluded in place_types for excluded in excluded_types):
        return False

    # Must have coffee shop or cafe type
    if "coffee_shop" in place_types or "cafe" in place_types:
        return True

    # Exclude obvious non-coffee places by name
    name_lower = name.lower()
    excluded_names = [
        "bravo", "supermarket", "mall", "hotel", "restaurant", "pub",
        "city park", "white city", "old city", "bazarstore", "market",
        "steakhouse", "kabab", "vapiano", "bistro", "wine", "grill"
    ]

    if any(excluded in name_lower for excluded in excluded_names):
        return False

    return False


def scrape_all_coffeeshops() -> List[Dict]:
    """
    Scrape all coffee shops from the defined chains

    Returns:
        List of coffee shop data dictionaries
    """
    all_shops = []
    seen_place_ids = set()
    filtered_count = 0

    print(f"Starting to scrape {len(COFFEE_CHAINS)} coffee chains in Baku...")
    print(f"API Key configured: {'Yes' if API_KEY else 'No'}\n")

    for chain_name in COFFEE_CHAINS:
        print(f"Searching for: {chain_name}")

        # Search for places
        places = search_places(chain_name)
        print(f"  Found {len(places)} results")

        for place in places:
            place_id = place.get("id")

            # Skip duplicates
            if place_id in seen_place_ids:
                continue

            seen_place_ids.add(place_id)
            time.sleep(0.3)  # Rate limiting

            # Extract coordinates
            location = place.get("location", {})
            lat = location.get("latitude", "N/A")
            lng = location.get("longitude", "N/A")

            # Extract address
            address = place.get("formattedAddress", "N/A")

            # Extract display name
            display_name = place.get("displayName", {})
            name = display_name.get("text", "N/A") if isinstance(display_name, dict) else str(display_name)

            # Extract types
            place_types = place.get("types", [])

            # Filter out locations not in Azerbaijan
            if not is_in_azerbaijan(address, lat, lng):
                filtered_count += 1
                print(f"    ✗ Filtered (not in Azerbaijan): {name} - {address}")
                continue

            # Filter out non-coffee shops
            if not is_coffee_shop(place_types, name):
                filtered_count += 1
                print(f"    ✗ Filtered (not a coffee shop): {name} - Types: {', '.join(place_types[:3])}")
                continue

            # Extract and format data
            shop_data = {
                "chain_name": chain_name,
                "name": name,
                "address": address,
                "latitude": lat,
                "longitude": lng,
                "phone": place.get("nationalPhoneNumber", "N/A"),
                "website": place.get("websiteUri", "N/A"),
                "rating": place.get("rating", "N/A"),
                "total_ratings": place.get("userRatingCount", "N/A"),
                "price_level": place.get("priceLevel", "N/A"),
                "business_status": place.get("businessStatus", "N/A"),
                "opening_hours": format_opening_hours(place.get("regularOpeningHours")),
                "google_maps_url": place.get("googleMapsUri", "N/A"),
                "place_id": place_id,
                "types": ", ".join(place.get("types", [])),
                "scraped_at": datetime.now().isoformat()
            }

            all_shops.append(shop_data)
            print(f"    ✓ Added: {shop_data['name']}")

        print()

    if filtered_count > 0:
        print(f"⚠️  Filtered out {filtered_count} locations not in Azerbaijan\n")

    return all_shops


def save_to_csv(data: List[Dict], output_file: str):
    """
    Save coffee shop data to CSV file

    Args:
        data: List of coffee shop dictionaries
        output_file: Path to output CSV file
    """
    if not data:
        print("No data to save!")
        return

    # Ensure output directory exists
    os.makedirs(os.path.dirname(output_file), exist_ok=True)

    # Define CSV columns
    fieldnames = [
        "chain_name",
        "name",
        "address",
        "latitude",
        "longitude",
        "phone",
        "website",
        "rating",
        "total_ratings",
        "price_level",
        "business_status",
        "opening_hours",
        "google_maps_url",
        "place_id",
        "types",
        "scraped_at"
    ]

    with open(output_file, 'w', newline='', encoding='utf-8') as csvfile:
        writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(data)

    print(f"Successfully saved {len(data)} coffee shops to {output_file}")


def main():
    """Main execution function"""
    print("=" * 60)
    print("Coffee Shop Data Scraper for Baku")
    print("=" * 60)
    print()

    # Check API key
    if not API_KEY:
        print("⚠️  WARNING: Please set your Google Places API key!")
        print("   You can get one from: https://console.cloud.google.com/apis/credentials")
        print("   Set it in .env file: GOOGLE_PLACES_API_KEY='your-key'")
        print("   Or set as environment variable: export GOOGLE_PLACES_API_KEY='your-key'")
        print()
        return

    # Scrape data
    coffee_shops = scrape_all_coffeeshops()

    # Save to CSV
    output_path = os.path.join(os.path.dirname(__file__), "..", "data", "coffeeshops.csv")
    output_path = os.path.abspath(output_path)
    save_to_csv(coffee_shops, output_path)

    print()
    print("=" * 60)
    print("Summary:")
    print(f"  Total coffee shops found: {len(coffee_shops)}")
    print(f"  Unique chains searched: {len(COFFEE_CHAINS)}")
    print(f"  Output file: {output_path}")
    print("=" * 60)


if __name__ == "__main__":
    main()
