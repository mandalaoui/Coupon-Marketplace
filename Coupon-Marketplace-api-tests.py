"""
Coupon Marketplace - API Test Suite (requests)
------------------------------------------------
Runs end-to-end checks against a running backend.

How to run:
  1) Make sure the backend is running (docker-compose up OR npm start)
  2) pip install requests
  3) python Coupon-Marketplace-api-tests.py

Config (env vars):
  BASE_URL        default: http://localhost:12345
  ADMIN_EMAIL     default: admin@example.com
  ADMIN_PASSWORD  default: Admin1234!
  RESELLER_TOKEN  default: token1
"""

import os
import sys
import time
import uuid
import json
import math
import requests
import logging

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(message)s",
    stream=sys.stdout,
)

BASE_URL = os.getenv("BASE_URL", "http://localhost:12345").rstrip("/")
ADMIN_EMAIL = os.getenv("ADMIN_EMAIL", "admin@example.com")
ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD", "AdminPassword123!")
RESELLER_TOKEN = os.getenv("RESELLER_TOKEN", "token1")

TIMEOUT = 10

def _pp(obj):
    return json.dumps(obj, indent=2, ensure_ascii=False)

def assert_eq(a, b, msg=""):
    if a != b:
        logging.error(f"Assert failed: {msg}\nExpected: {b}\nGot: {a}")
        raise AssertionError(f"{msg}\nExpected: {b}\nGot: {a}")

def assert_in(x, container, msg=""):
    if x not in container:
        logging.error(f"Assert failed: {msg}\nMissing: {x}\nContainer: {container}")
        raise AssertionError(f"{msg}\nMissing: {x}\nContainer: {container}")

def assert_status(resp, expected):
    if resp.status_code != expected:
        logging.error(
            f"HTTP {resp.request.method} {resp.url}\n"
            f"Expected status {expected}, got {resp.status_code}\n"
            f"Body:\n{resp.text}"
        )
        raise AssertionError(
            f"HTTP {resp.request.method} {resp.url}\n"
            f"Expected status {expected}, got {resp.status_code}\n"
            f"Body:\n{resp.text}"
        )

def assert_error_format(resp, expected_code=None):
    try:
        data = resp.json()
    except Exception:
        logging.error(f"Expected JSON error response. Got:\n{resp.text}")
        raise AssertionError(f"Expected JSON error response. Got:\n{resp.text}")
    assert_in("error_code", data, "Error response must include error_code")
    assert_in("message", data, "Error response must include message")
    if expected_code:
        assert_eq(data["error_code"], expected_code, "Wrong error_code")
    logging.info(f"Error response format validated, code: {data.get('error_code')}")
    return data

def request_json(method, path, *, headers=None, json_body=None, expected_status=None):
    url = f"{BASE_URL}{path}"
    logging.info(f"Request: {method} {url} with headers={headers} body={_pp(json_body) if json_body else '{}'}")
    resp = requests.request(method, url, headers=headers, json=json_body, timeout=TIMEOUT)
    logging.info(f"Response: {resp.status_code} {resp.text[:200]}")
    if expected_status is not None:
        assert_status(resp, expected_status)
    return resp

def health_check():
    logging.info("Performing health check...")
    resp = request_json("GET", "/api/health", expected_status=200)
    data = resp.json()
    assert_in("status", data, "Health response should include status")
    logging.info(f"Health check status: {data.get('status')}")
    return True

def admin_login():
    logging.info("Logging in as admin...")
    resp = request_json(
        "POST",
        "/api/admin/auth/login",
        json_body={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD},
        expected_status=200,
    )
    data = resp.json()
    assert_in("token", data, "Admin login must return token")
    logging.info("Admin login successful, token received.")
    return data["token"]

def admin_create_coupon(admin_token, *, name_suffix=""):
    # Create a unique coupon so the test can run repeatedly
    uid = str(uuid.uuid4())[:8]
    body = {
        "name": f"Test Coupon {name_suffix} {uid}",
        "description": "Automated test coupon",
        "image_url": "https://placehold.co/600x300?text=Test+Coupon",
        "cost_price": 80.0,
        "margin_percentage": 25.0,
        "value_type": "STRING",
        "value": f"TEST-{uid}",
    }
    logging.info(f"Creating admin coupon with body: {_pp(body)}")
    resp = request_json(
        "POST",
        "/api/admin/products",
        headers={"Authorization": f"Bearer {admin_token}"},
        json_body=body,
        expected_status=201,
    )
    data = resp.json()
    assert_in("id", data, "Admin create must return id")
    # Expected derived minimum_sell_price = 100.00
    assert_in("minimum_sell_price", data, "Admin create must return minimum_sell_price")
    min_price = float(data["minimum_sell_price"])
    if not math.isclose(min_price, 100.0, abs_tol=0.01):
        logging.error(f"Bad minimum_sell_price. Expected ~100.0, got {min_price}\nBody:\n{_pp(data)}")
        raise AssertionError(f"Bad minimum_sell_price. Expected ~100.0, got {min_price}\nBody:\n{_pp(data)}")
    logging.info(f"Admin coupon created: {data['id']} min_sell_price: {min_price}")
    return data

def admin_delete_coupon(admin_token, product_id):
    logging.info(f"Deleting admin coupon: {product_id}")
    resp = request_json(
        "DELETE",
        f"/api/admin/products/{product_id}",
        headers={"Authorization": f"Bearer {admin_token}"},
        expected_status=200,
    )
    data = resp.json()
    assert_eq(data.get("id"), product_id, "Delete should return deleted id")
    logging.info(f"Deleted coupon: {product_id}")
    return True

def public_list_customer():
    logging.info("Listing public customer products...")
    resp = request_json("GET", "/api/shop/products", expected_status=200)
    data = resp.json()
    if not isinstance(data, list):
        logging.error("Customer list should return an array")
        raise AssertionError("Customer list should return an array")
    logging.info(f"Received {len(data)} public products")
    return data

def reseller_list(token=None, expected_status=200):
    headers = {}
    if token is not None:
        headers["Authorization"] = f"Bearer {token}"
    logging.info(f"Listing reseller products as token={token}")
    resp = request_json("GET", "/api/v1/products", headers=headers, expected_status=expected_status)
    return resp

def reseller_purchase(product_id, reseller_price, token, expected_status=200):
    logging.info(f"Reseller purchasing product {product_id} for {reseller_price} as token={token}")
    resp = request_json(
        "POST",
        f"/api/v1/products/{product_id}/purchase",
        headers={"Authorization": f"Bearer {token}"},
        json_body={"reseller_price": reseller_price},
        expected_status=expected_status,
    )
    return resp

def customer_purchase(product_id, expected_status=200):
    logging.info(f"Customer purchasing product {product_id}")
    resp = request_json(
        "POST",
        f"/api/shop/products/{product_id}/purchase",
        json_body={},
        expected_status=expected_status,
    )
    return resp

def assert_public_product_shape(item):
    # Spec requires: id, name, description, image_url, price
    required = {"id", "name", "description", "image_url", "price"}
    extra = set(item.keys()) - required
    missing = required - set(item.keys())
    if missing:
        logging.error(f"Public product is missing fields: {missing}\nItem:\n{_pp(item)}")
        raise AssertionError(f"Public product is missing fields: {missing}\nItem:\n{_pp(item)}")
    if extra:
        logging.error(f"Public product contains extra fields not in spec: {sorted(extra)}\nItem:\n{_pp(item)}")
        raise AssertionError(f"Public product contains extra fields not in spec: {sorted(extra)}\nItem:\n{_pp(item)}")
    logging.info(f"Public product shape OK: {item.get('id', '?')}")

def run():
    print(f"BASE_URL={BASE_URL}")
    logging.info(f"Running test suite at BASE_URL={BASE_URL}")
    ok = health_check()
    print("✅ health_check")

    # Reseller auth tests
    resp = reseller_list(token=None, expected_status=401)
    assert_error_format(resp, "UNAUTHORIZED")
    print("✅ reseller_list without token -> 401")

    resp = reseller_list(token="wrong", expected_status=401)
    assert_error_format(resp, "UNAUTHORIZED")
    print("✅ reseller_list invalid token -> 401")

    # Admin login
    admin_token = admin_login()
    print("✅ admin_login")

    # Create a coupon A for customer purchase tests
    coupon_a = admin_create_coupon(admin_token, name_suffix="A")
    print("✅ admin_create_coupon A")

    # Public listing should include the coupon and match strict response shape
    items = public_list_customer()
    if len(items) == 0:
        logging.error("Expected at least one product in customer list")
        raise AssertionError("Expected at least one product in customer list")
    # Find our created coupon and validate response shape
    found = next((x for x in items if x.get("id") == coupon_a["id"]), None)
    if not found:
        logging.error("Created coupon A not found in customer list")
        raise AssertionError("Created coupon A not found in customer list")
    assert_public_product_shape(found)
    print("✅ customer_list product shape")

    # Customer purchase succeeds, returns coupon value, then 2nd attempt fails with 409
    resp = customer_purchase(coupon_a["id"], expected_status=200)
    data = resp.json()
    assert_eq(data.get("product_id"), coupon_a["id"], "customer purchase must return product_id")
    assert_eq(float(data.get("final_price")), 100.0, "customer final_price must equal minimum_sell_price")
    assert_eq(data.get("value_type"), "STRING", "value_type")
    assert_in("value", data, "customer purchase must return value")
    print("✅ customer_purchase success")

    resp = customer_purchase(coupon_a["id"], expected_status=409)
    assert_error_format(resp, "PRODUCT_ALREADY_SOLD")
    print("✅ customer_purchase already sold -> 409")

    # Create coupon B for reseller tests
    coupon_b = admin_create_coupon(admin_token, name_suffix="B")
    print("✅ admin_create_coupon B")

    # Reseller list response shape
    resp = reseller_list(token=RESELLER_TOKEN, expected_status=200)
    products = resp.json()
    if not isinstance(products, list):
        logging.error("Reseller list should return an array")
        raise AssertionError("Reseller list should return an array")
    found = next((x for x in products if x.get("id") == coupon_b["id"]), None)
    if not found:
        logging.error("Created coupon B not found in reseller list")
        raise AssertionError("Created coupon B not found in reseller list")
    assert_public_product_shape(found)
    print("✅ reseller_list product shape")

    # Reseller purchase too low
    resp = reseller_purchase(coupon_b["id"], reseller_price=99.99, token=RESELLER_TOKEN, expected_status=400)
    assert_error_format(resp, "RESELLER_PRICE_TOO_LOW")
    print("✅ reseller_purchase too low -> 400")

    # Reseller purchase at min works
    resp = reseller_purchase(coupon_b["id"], reseller_price=100.0, token=RESELLER_TOKEN, expected_status=200)
    data = resp.json()
    assert_eq(data.get("product_id"), coupon_b["id"], "reseller purchase must return product_id")
    assert_eq(float(data.get("final_price")), 100.0, "reseller final_price must equal reseller_price")
    assert_eq(data.get("value_type"), "STRING", "value_type")
    assert_in("value", data, "reseller purchase must return value")
    print("✅ reseller_purchase success")

    # Reseller purchase sold -> 409
    resp = reseller_purchase(coupon_b["id"], reseller_price=120.0, token=RESELLER_TOKEN, expected_status=409)
    assert_error_format(resp, "PRODUCT_ALREADY_SOLD")
    print("✅ reseller_purchase already sold -> 409")

    # Product not found tests
    fake_id = "00000000-0000-0000-0000-000000000000"
    resp = request_json("GET", f"/api/v1/products/{fake_id}", headers={"Authorization": f"Bearer {RESELLER_TOKEN}"}, expected_status=404)
    assert_error_format(resp, "PRODUCT_NOT_FOUND")
    print("✅ reseller_get not found -> 404")

    resp = reseller_purchase(fake_id, reseller_price=120.0, token=RESELLER_TOKEN, expected_status=404)
    assert_error_format(resp, "PRODUCT_NOT_FOUND")
    print("✅ reseller_purchase not found -> 404")

    # Cleanup (best effort)
    for pid in [coupon_a["id"], coupon_b["id"]]:
        try:
            admin_delete_coupon(admin_token, pid)
        except Exception as e:
            logging.warning(f"⚠️ cleanup failed for {pid}: {e}")
            print(f"⚠️ cleanup failed for {pid}: {e}")

    print("\n🎉 ALL TESTS PASSED")
    logging.info("🎉 ALL TESTS PASSED")

if __name__ == "__main__":
    try:
        run()
    except Exception as e:
        print("\n❌ TESTS FAILED")
        logging.error(f"❌ TESTS FAILED: {e}")
        print(e)
        sys.exit(1)
