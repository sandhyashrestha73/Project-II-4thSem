import re


def format_npr(amount):
    """Format a number as NPR text, e.g. 18000 -> 'NPR 18,000'."""
    if amount is None:
        return "Not specified"
    if float(amount).is_integer():
        return f"NPR {int(amount):,}"
    return f"NPR {amount:,.2f}"


def parse_duration(text):
    """
    Try to read days/nights from text like '3 Days 2 Nights'.
    Returns {"days": int|None, "nights": int|None}.
    """
    text = text or ""
    days = re.search(r"(\d+)\s*days?", text, re.IGNORECASE)
    nights = re.search(r"(\d+)\s*nights?", text, re.IGNORECASE)
    return {
        "days": int(days.group(1)) if days else None,
        "nights": int(nights.group(1)) if nights else None,
    }


def _same_text(a, b):
    if not a or not b:
        return None  # unknown
    return a.strip().lower() == b.strip().lower()


def compare_packages(a, b):
    """
    a and b are plain dicts built from trusted database data.
    Returns the facts calculated by Python (no AI involved).
    """

    # ---- Price ----
    price_a, price_b = a["price"], b["price"]
    if price_a is None or price_b is None:
        price = {
            "packageA": format_npr(price_a),
            "packageB": format_npr(price_b),
            "difference": None,
            "cheaper": None,
        }
    else:
        if price_a == price_b:
            cheaper = "same"
        else:
            cheaper = "packageA" if price_a < price_b else "packageB"
        price = {
            "packageA": format_npr(price_a),
            "packageB": format_npr(price_b),
            "difference": format_npr(abs(price_a - price_b)),
            "cheaper": cheaper,
        }

    # ---- Duration ----
    dur_a = parse_duration(a["duration"])
    dur_b = parse_duration(b["duration"])
    if dur_a["days"] is not None and dur_b["days"] is not None:
        same_duration = dur_a == dur_b
    else:
        same_duration = _same_text(a["duration"], b["duration"])
    duration = {
        "packageA": a["duration"] or "Not specified",
        "packageB": b["duration"] or "Not specified",
        "same": same_duration,
    }

    # ---- Destination ----
    destination = {
        "packageA": a["destination"] or "Not specified",
        "packageB": b["destination"] or "Not specified",
        "same": _same_text(a["destination"], b["destination"]),
    }

    # ---- Agency ----
    agency = {
        "packageA": a["agency_name"] or "Not specified",
        "packageB": b["agency_name"] or "Not specified",
        "same": _same_text(a["agency_name"], b["agency_name"]),
    }

    # ---- Rating ----
    def rating_text(p):
        if not p["total_reviews"]:
            return "No reviews yet"
        return f'{p["average_rating"]} / 5 ({p["total_reviews"]} reviews)'

    rating = {
        "packageA": rating_text(a),
        "packageB": rating_text(b),
    }

    return {
        "price": price,
        "duration": duration,
        "destination": destination,
        "agency": agency,
        "rating": rating,
    }