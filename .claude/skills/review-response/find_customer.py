#!/usr/bin/env python3
"""
find_customer.py — Unified Pink Auto Glass customer lookup for review responses.

PRIMARY SOURCE: omega_installs table (the invoice/installs table — where
completed-job customer data lives, including vehicle, address, and line items).

FALLBACK: leads table (for phone cross-reference when Omega has no name match).

Usage:
    python3 find_customer.py "First Last"
    python3 find_customer.py --phone +15555551234
    python3 find_customer.py "First Last" --phone +15555551234

Environment (read from ../../../.env.local):
    NEXT_PUBLIC_SUPABASE_URL
    SUPABASE_SERVICE_ROLE_KEY

Output (JSON, printed to stdout):
    {
      "match_source": "omega_installs" | "leads_by_phone" | "none",
      "match_confidence": "exact" | "partial_last" | "partial_first" | "phone" | "none",
      "alternatives_count": int,
      "customer_name": "...",
      "first_name": "...",
      "vehicle_year": 2020,
      "vehicle_make": "Honda",
      "vehicle_model": "Civic",
      "service_type": "repair" | "replacement" | "unknown",
      "city": "Denver",
      "state": "CO",
      "raw_address": "...",
      "install_date": "YYYY-MM-DD",
      "phone": "+15555551234",
      "notes": "...",
      "alternatives": [...]
    }
"""
import argparse
import json
import os
import re
import sys
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path


# --- Env loading --------------------------------------------------------------

def load_env_local(start_path: Path) -> dict:
    """Walk upward from start_path to find .env.local and load it."""
    cur = start_path.resolve()
    for parent in [cur, *cur.parents]:
        candidate = parent / ".env.local"
        if candidate.is_file():
            env = {}
            for line in candidate.read_text().splitlines():
                line = line.strip()
                if not line or line.startswith("#") or "=" not in line:
                    continue
                k, _, v = line.partition("=")
                env[k.strip()] = v.strip().strip('"').strip("'")
            return env
    return {}


# Skill lives at <project>/.claude/skills/review-response/find_customer.py
# so .env.local is 3 levels up.
ENV = load_env_local(Path(__file__).parent)
SUPABASE_URL = ENV.get("NEXT_PUBLIC_SUPABASE_URL") or os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
SERVICE_KEY = ENV.get("SUPABASE_SERVICE_ROLE_KEY") or os.environ.get("SUPABASE_SERVICE_ROLE_KEY")

if not SUPABASE_URL or not SERVICE_KEY:
    print(json.dumps({
        "error": "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY; check .env.local"
    }))
    sys.exit(1)


# --- Supabase REST helpers ----------------------------------------------------

def _request(path: str, params: dict) -> list:
    url = f"{SUPABASE_URL}/rest/v1/{path}?{urllib.parse.urlencode(params)}"
    req = urllib.request.Request(
        url,
        headers={
            "apikey": SERVICE_KEY,
            "Authorization": f"Bearer {SERVICE_KEY}",
            "Content-Type": "application/json",
        },
    )
    try:
        with urllib.request.urlopen(req, timeout=30) as r:
            return json.loads(r.read())
    except urllib.error.HTTPError as e:
        return [{"__error__": f"HTTP {e.code}: {e.read().decode()[:300]}"}]


OMEGA_COLS = (
    "id,customer_name,customer_phone,customer_email,vehicle_year,vehicle_make,"
    "vehicle_model,job_type,install_date,raw_data,matched_lead_id,total_revenue,status"
)

LEADS_COLS = (
    "id,first_name,last_name,phone_e164,email,city,state,zip,address,"
    "vehicle_year,vehicle_make,vehicle_model,service_type,status,created_at"
)


# --- Parsing helpers ----------------------------------------------------------

STREET_TYPES = {
    "dr", "drive", "st", "street", "blvd", "boulevard", "ave", "avenue", "way",
    "ct", "court", "rd", "road", "ln", "lane", "pl", "place", "pkwy", "parkway",
    "cir", "circle", "ter", "terrace", "hwy", "highway", "trl", "trail", "loop",
    "e", "w", "n", "s", "ne", "nw", "se", "sw",
}


def parse_city_state(address: str):
    """Extract city and state from a free-form US address. Anchors on STATE + ZIP."""
    if not address:
        return None, None
    normalized = re.sub(r"\.\s", " ", address)
    m = re.search(
        r"([A-Za-z][\w\s]*?)\s*,?\s*(CO|AZ|Colorado|Arizona)\s+\d{5}",
        normalized,
        re.IGNORECASE,
    )
    if not m:
        return None, None
    city_chunk = m.group(1).strip()
    state_raw = m.group(2).upper()
    state = {"COLORADO": "CO", "ARIZONA": "AZ"}.get(state_raw, state_raw)

    tokens = re.findall(r"[A-Za-z]+", city_chunk)
    if not tokens:
        return None, state

    # Walk from the end; city is the trailing alpha tokens until we hit a street-type word
    result = []
    for tok in reversed(tokens):
        if tok.lower() in STREET_TYPES:
            break
        result.insert(0, tok)
    if not result:
        return None, state
    return " ".join(w.capitalize() for w in result), state


def infer_service_type(job_type: str, line_items: list) -> str:
    """Pick 'repair' vs 'replacement' from Omega line_items and job_type."""
    texts = []
    if job_type:
        texts.append(job_type.lower())
    for item in line_items or []:
        desc = (item.get("description") or "").lower()
        if desc:
            texts.append(desc)
    blob = " | ".join(texts)

    if re.search(r"\bchip\s*repair\b|\brock\s*chip\b|\bresin\b", blob):
        return "repair"
    # Presence of a windshield part + any install/remove keyword indicates replacement
    if "windshield" in blob and re.search(r"remove|install|replace|adhesive|urethane", blob):
        return "replacement"
    if "replacement" in blob:
        return "replacement"
    if "repair" in blob:
        return "repair"
    if "windshield" in blob:
        # Default: a raw windshield part in the invoice means a full replacement
        return "replacement"
    return "unknown"


# --- Core lookups -------------------------------------------------------------

def _omega_row_to_record(row: dict) -> dict:
    raw = row.get("raw_data") or {}
    line_items = raw.get("line_items", [])
    address = raw.get("customer_address") or ""
    city, state = parse_city_state(address)
    full_name = (row.get("customer_name") or "").strip()
    first = full_name.split()[0] if full_name else ""
    return {
        "customer_name": full_name,
        "first_name": first.capitalize(),
        "vehicle_year": row.get("vehicle_year"),
        "vehicle_make": row.get("vehicle_make"),
        "vehicle_model": row.get("vehicle_model"),
        "service_type": infer_service_type(row.get("job_type"), line_items),
        "city": city,
        "state": state,
        "raw_address": address,
        "install_date": (row.get("install_date") or "")[:10],
        "phone": row.get("customer_phone"),
        "email": row.get("customer_email"),
        "total_revenue": row.get("total_revenue"),
        "omega_id": row.get("id"),
        "matched_lead_id": row.get("matched_lead_id"),
    }


def _leads_row_to_record(row: dict) -> dict:
    first = (row.get("first_name") or "").strip()
    last = (row.get("last_name") or "").strip()
    # If leads has a city column, use it; otherwise try to infer from address/zip
    city = row.get("city")
    state = row.get("state")
    address = row.get("address") or ""
    if not city and address:
        city, state = parse_city_state(address)
    svc = row.get("service_type")  # enum: 'repair' or 'replacement' or None
    return {
        "customer_name": f"{first} {last}".strip(),
        "first_name": first.capitalize() if first else "",
        "vehicle_year": row.get("vehicle_year"),
        "vehicle_make": row.get("vehicle_make"),
        "vehicle_model": row.get("vehicle_model"),
        "service_type": svc or "unknown",
        "city": city,
        "state": state,
        "raw_address": address,
        "install_date": (row.get("created_at") or "")[:10],
        "phone": row.get("phone_e164"),
        "email": row.get("email"),
        "lead_id": row.get("id"),
    }


def search_omega_by_name(first: str, last: str) -> list:
    """Search omega_installs customer_name with progressive loosening."""
    attempts = [
        (f"ilike.*{first}*{last}*", "exact"),
        (f"ilike.*{last}*", "partial_last"),
        (f"ilike.*{first}*", "partial_first"),
    ]
    for pattern, conf in attempts:
        rows = _request(
            "omega_installs",
            {
                "select": OMEGA_COLS,
                "customer_name": pattern,
                "order": "install_date.desc",
                "limit": "10",
            },
        )
        if rows and not rows[0].get("__error__"):
            return rows, conf
    return [], "none"


def search_omega_by_phone(phone: str) -> list:
    rows = _request(
        "omega_installs",
        {
            "select": OMEGA_COLS,
            "customer_phone": f"eq.{phone}",
            "order": "install_date.desc",
            "limit": "5",
        },
    )
    return rows if rows and not rows[0].get("__error__") else []


def search_leads_by_phone(phone: str) -> list:
    rows = _request(
        "leads",
        {
            "select": LEADS_COLS,
            "phone_e164": f"eq.{phone}",
            "order": "created_at.desc",
            "limit": "5",
        },
    )
    return rows if rows and not rows[0].get("__error__") else []


def lookup(name: str = None, phone: str = None) -> dict:
    # 1. Phone is the most reliable key if provided
    if phone:
        rows = search_omega_by_phone(phone)
        if rows:
            record = _omega_row_to_record(rows[0])
            return {
                "match_source": "omega_installs",
                "match_confidence": "phone",
                "alternatives_count": len(rows),
                **record,
                "alternatives": [_omega_row_to_record(r) for r in rows[1:]],
                "notes": "",
            }

    # 2. Name lookup in omega_installs (primary source for completed jobs)
    if name:
        parts = name.strip().split()
        if len(parts) < 2:
            return {"match_source": "none", "match_confidence": "none", "error": "need first + last name", "alternatives_count": 0}
        first = parts[0]
        last = " ".join(parts[1:])
        rows, conf = search_omega_by_name(first, last)
        if rows:
            primary = _omega_row_to_record(rows[0])
            alternatives = [_omega_row_to_record(r) for r in rows[1:]]
            notes = []
            if len(rows) > 1:
                notes.append(f"{len(rows)} candidates matched — primary is most recent install; verify before using")
            return {
                "match_source": "omega_installs",
                "match_confidence": conf,
                "alternatives_count": len(rows),
                **primary,
                "alternatives": alternatives,
                "notes": "; ".join(notes),
            }

    # 3. Fallback: leads by phone (phone-only lead rows have no name)
    if phone:
        rows = search_leads_by_phone(phone)
        if rows:
            record = _leads_row_to_record(rows[0])
            return {
                "match_source": "leads_by_phone",
                "match_confidence": "phone",
                "alternatives_count": len(rows),
                **record,
                "alternatives": [_leads_row_to_record(r) for r in rows[1:]],
                "notes": "Phone matched a leads row (no invoice yet in Omega) — data may be incomplete",
            }

    return {
        "match_source": "none",
        "match_confidence": "none",
        "alternatives_count": 0,
        "notes": "No match in omega_installs or leads; customer may have booked under a different name or is not in the system",
    }


# --- CLI entrypoint -----------------------------------------------------------

def main():
    p = argparse.ArgumentParser(description="Pink Auto Glass customer lookup")
    p.add_argument("name", nargs="?", help="Customer full name (e.g. 'Jane Smith')")
    p.add_argument("--phone", help="Customer phone in E.164 format (e.g. +15555551234)")
    args = p.parse_args()

    if not args.name and not args.phone:
        p.print_help()
        sys.exit(1)

    result = lookup(args.name, args.phone)
    print(json.dumps(result, indent=2, default=str))


if __name__ == "__main__":
    main()
