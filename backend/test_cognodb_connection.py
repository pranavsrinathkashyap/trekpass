import sys
import io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

import os
from dotenv import load_dotenv
from neo4j import GraphDatabase

load_dotenv()

uri = os.getenv("COGNODB_URI")
user = os.getenv("COGNODB_USER")
password = os.getenv("COGNODB_PASSWORD")

print(f"Connecting to CognoDB at: {uri} (User: {user})")

try:
    driver = GraphDatabase.driver(uri, auth=(user, password))
    driver.verify_connectivity()
    print("[SUCCESS] Connected and verified Bolt connectivity to CognoDB Cloud!")

    with driver.session() as session:
        result = session.run("RETURN 'Hello from CognoDB Cloud!' AS greeting, 1 + 1 AS calc")
        record = result.single()
        print(f"[QUERY RESULT] Greeting: {record['greeting']}, Calculation: {record['calc']}")

    driver.close()
    print("[SUCCESS] All tests passed against live CognoDB instance!")
except Exception as e:
    print(f"[ERROR] Connection failed: {e}")
