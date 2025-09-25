#!/bin/bash

echo "Starting ARIA Monitoring Dashboard..."
echo ""
echo "======================================"
echo "📊 ARIA Protection Monitor"
echo "======================================"
echo ""
echo "Dashboard will be available at:"
echo "  http://localhost:8080/"
echo ""
echo "Also try:"
echo "  http://127.0.0.1:8080/"
echo ""
echo "Metrics API:"
echo "  http://localhost:8080/metrics"
echo ""
echo "Starting server..."
echo ""

cd "/Volumes/T7 Shield/Projects/SpiralogicOracleSystem/deploy"
node monitoring_server.js