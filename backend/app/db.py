import logging
from typing import Any, Dict, List, Optional
from neo4j import GraphDatabase, Driver, Session
from app.config import settings

logger = logging.getLogger("trekpass.db")

class DatabaseManager:
    """
    Manages connection lifecycle to CognoDB / Neo4j Graph Database
    using the official Neo4j Python driver.
    """
    def __init__(self):
        self._driver: Optional[Driver] = None
        self._is_connected: bool = False
        self._connection_error: Optional[str] = None

    def get_driver(self) -> Optional[Driver]:
        if self._driver is not None:
            return self._driver
        
        if not settings.COGNODB_URI or not settings.COGNODB_PASSWORD:
            self._connection_error = (
                "CognoDB credentials missing. Please configure COGNODB_URI and COGNODB_PASSWORD in .env"
            )
            return None

        try:
            # Connect via official Neo4j Bolt driver (compatible with CognoDB Cloud Bolt 5.0-5.4)
            self._driver = GraphDatabase.driver(
                settings.COGNODB_URI,
                auth=(settings.COGNODB_USER, settings.COGNODB_PASSWORD),
                max_connection_lifetime=3600,
                max_connection_pool_size=50,
                connection_acquisition_timeout=15.0
            )
            # Verify connectivity
            self._driver.verify_connectivity()
            self._is_connected = True
            self._connection_error = None
            logger.info("Successfully connected to CognoDB Graph Database.")
            return self._driver
        except Exception as e:
            self._is_connected = False
            self._connection_error = str(e)
            logger.warning(f"CognoDB connection failed: {e}")
            if self._driver:
                try:
                    self._driver.close()
                except Exception:
                    pass
                self._driver = None
            return None

    def close(self):
        if self._driver:
            try:
                self._driver.close()
                logger.info("CognoDB driver connection closed.")
            except Exception as e:
                logger.error(f"Error closing CognoDB driver: {e}")
            finally:
                self._driver = None
                self._is_connected = False

    def check_health(self) -> Dict[str, Any]:
        """Diagnostic health check for the graph database."""
        driver = self.get_driver()
        if not driver:
            return {
                "status": "disconnected",
                "connected": False,
                "uri": settings.COGNODB_URI or "Not configured",
                "user": settings.COGNODB_USER,
                "error": self._connection_error or "Driver not initialized",
                "mode": "standalone/fallback"
            }
        
        try:
            with driver.session() as session:
                result = session.run("RETURN 1 AS ping")
                record = result.single()
                if record and record["ping"] == 1:
                    return {
                        "status": "healthy",
                        "connected": True,
                        "uri": settings.COGNODB_URI,
                        "user": settings.COGNODB_USER,
                        "protocol": "Bolt 5.x (CognoDB Cloud)",
                        "error": None
                    }
        except Exception as e:
            self._is_connected = False
            self._connection_error = str(e)
            return {
                "status": "error",
                "connected": False,
                "uri": settings.COGNODB_URI,
                "user": settings.COGNODB_USER,
                "error": str(e)
            }
        
        return {"status": "unknown", "connected": False, "error": "Unknown error during health check"}

    def run_query(self, cypher: str, parameters: Optional[Dict[str, Any]] = None) -> List[Dict[str, Any]]:
        """
        Executes a parameterized Cypher query and returns a list of dictionaries.
        Guarantees parameterized execution with no string concatenation.
        """
        driver = self.get_driver()
        if not driver:
            raise ConnectionError(self._connection_error or "Database not connected.")
        
        params = parameters or {}
        with driver.session() as session:
            result = session.run(cypher, params)
            return [record.data() for record in result]

    def execute_write(self, cypher: str, parameters: Optional[Dict[str, Any]] = None) -> List[Dict[str, Any]]:
        """Executes a parameterized Cypher write transaction."""
        driver = self.get_driver()
        if not driver:
            raise ConnectionError(self._connection_error or "Database not connected.")
        
        params = parameters or {}
        with driver.session() as session:
            def _tx(tx):
                res = tx.run(cypher, params)
                return [rec.data() for rec in res]
            return session.execute_write(_tx)

db_manager = DatabaseManager()
