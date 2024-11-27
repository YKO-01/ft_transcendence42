#!/bin/bash

# Create Index Patterns
# curl -s -k --cacert config/certs/kibana/kibana.crt -u ${ELASTIC_USER}:${ELASTIC_PASSWORD} -X POST "https://kibana:5601/api/index_patterns/index-pattern" \
# -H "kbn-xsrf: true" \
# -H "Content-Type: application/json" \
# -d '{
#   "override": true,
#   "index_pattern": {
#     "title": "logs-nginx-pattern",
#     "timeFieldName": "@timestamp"
#   }
# }'


# # Create Visualization
# curl -s -k --cacert config/certs/kibana/kibana.crt -u ${ELASTIC_USER}:${ELASTIC_PASSWORD} -X POST "https://kibana:5601/api/saved_objects/visualization" \
# -H "kbn-xsrf: true" \
# -H "Content-Type: application/json" \
# -d '{
#   "attributes": {
#     "title": "Log Level Distribution",
#     "visState": "{\"type\":\"bar\",\"params\":{\"addLegend\":true,\"isModel\":true,\"shareYAxis\":true},\"aggs\":[{\"id\":\"1\",\"type\":\"count\",\"schema\":\"metric\"},{\"id\":\"2\",\"type\":\"terms\",\"schema\":\"bucket\",\"params\":{\"field\":\"level.keyword\",\"size\":10}}]}",
#     "uiStateJSON": "{}",
#     "description": "",
#     "version": 1
#   }
# }'

# # Create Dashboard
# curl -s -k --cacert config/certs/kibana/kibana.crt -u ${ELASTIC_USER}:${ELASTIC_PASSWORD} -X POST "https://kibana:5601/api/saved_objects/dashboard" \
# -H "kbn-xsrf: true" \
# -H "Content-Type: application/json" \
# -d '{
#   "attributes": {
#     "title": "logs dashboard",
#     "description": "A dashboard for monitoring logs",
#     "panelsJSON": "[{\"panelIndex\":1,\"gridData\":{\"x\":0,\"y\":0,\"w\":12,\"h\":10,\"i\":\"1\"},\"id\":\"<visualization_id>\"}]",
#     "version": 1
#   }
# }'

apt update && apy install -y jq

KIBANA_URL="https://kibana:5601"
ES_URL="https://elasticsearch:9200"
CA_CERT="config/certs/ca/ca.crt"
ELASTIC_USER=${ELASTIC_USER}
ELASTIC_PASSWORD=${ELASTIC_PASSWORD}

echo "Applying Index Patterns..."

# Array of log sources
declare -A LOG_SOURCES
LOG_SOURCES=( ["nginx"]="nginx-logs-*" ["postgres"]="postgres-logs-*" ["django"]="django-logs-*" )

# Loop through each log source to create index patterns
for SOURCE in "${!LOG_SOURCES[@]}"; do
  INDEX_PATTERN="${LOG_SOURCES[$SOURCE]}"
  echo "Creating index pattern for ${INDEX_PATTERN}"

  curl -s -k --cacert "$CA_CERT" -u ${ELASTIC_USER}:${ELASTIC_PASSWORD} -X POST "$KIBANA_URL/api/saved_objects/index-pattern" \
    -H "kbn-xsrf: true" \
    -H "Content-Type: application/json" \
    -d "{
      \"attributes\": {
        \"title\": \"${INDEX_PATTERN}\",
        \"timeFieldName\": \"@timestamp\"
      }
    }"
done

echo "Creating Visualizations..."

# Example visualization creation (customize visualization settings as needed)
for SOURCE in "${!LOG_SOURCES[@]}"; do
  INDEX_PATTERN="${LOG_SOURCES[$SOURCE]}"
  VIS_TITLE="${SOURCE^} Log Counts by Day"
  echo "Creating visualization for ${VIS_TITLE}"

  curl -s -k --cacert "$CA_CERT" -u ${ELASTIC_USER}:${ELASTIC_PASSWORD} -X POST "$KIBANA_URL/api/saved_objects/visualization" \
    -H "kbn-xsrf: true" \
    -H "Content-Type: application/json" \
    -d "{
      \"attributes\": {
        \"title\": \"${VIS_TITLE}\",
        \"visState\": \"{\\\"title\\\":\\\"${VIS_TITLE}\\\",\\\"type\\\":\\\"histogram\\\",\\\"params\\\":{\\\"type\\\":\\\"histogram\\\",\\\"grid\\\":{\\\"categoryLines\\\":true},\\\"categoryAxes\\\":[{\\\"id\\\":\\\"CategoryAxis-1\\\",\\\"type\\\":\\\"category\\\",\\\"position\\\":\\\"bottom\\\",\\\"show\\\":true}],\\\"valueAxes\\\":[{\\\"id\\\":\\\"ValueAxis-1\\\",\\\"type\\\":\\\"value\\\",\\\"position\\\":\\\"left\\\",\\\"show\\\":true,\\\"scale\\\":{\\\"type\\\":\\\"linear\\\"}}]},\\\"aggs\\\":[{\\\"id\\\":\\\"1\\\",\\\"type\\\":\\\"count\\\",\\\"schema\\\":\\\"metric\\\"},{\\\"id\\\":\\\"2\\\",\\\"type\\\":\\\"date_histogram\\\",\\\"schema\\\":\\\"segment\\\",\\\"params\\\":{\\\"field\\\":\\\"@timestamp\\\",\\\"interval\\\":\\\"day\\\"}}]}\",
        \"uiStateJSON\": \"{}\",
        \"kibanaSavedObjectMeta\": {
          \"searchSourceJSON\": \"{\\\"index\\\":\\\"${INDEX_PATTERN}\\\",\\\"query\\\":{\\\"query\\\":\\\"\\\",\\\"language\\\":\\\"kuery\\\"},\\\"filter\\\":[]}\"
        }
      }
    }"
done

echo "Creating Dashboards..."

# Create dashboards and associate visualizations
for SOURCE in "${!LOG_SOURCES[@]}"; do
  DASH_TITLE="${SOURCE^} Log Overview"
  echo "Creating dashboard for ${DASH_TITLE}"

  # Create dashboard and get the dashboard ID
  DASHBOARD_ID=$(curl -s -k --cacert "$CA_CERT" -u ${ELASTIC_USER}:${ELASTIC_PASSWORD} -X POST "$KIBANA_URL/api/saved_objects/dashboard" \
    -H "kbn-xsrf: true" \
    -H "Content-Type: application/json" \
    -d "{
      \"attributes\": {
        \"title\": \"${DASH_TITLE}\",
        \"description\": \"Dashboard for visualizing ${SOURCE} log data and insights\"
      }
    }" | jq -r '.id')

  # Find the visualization ID associated with the current log source
  VIS_ID=$(curl -s -k --cacert "$CA_CERT" -u ${ELASTIC_USER}:${ELASTIC_PASSWORD} -X GET "$KIBANA_URL/api/saved_objects/_find?type=visualization&search=${SOURCE^} Log Counts by Day" | jq -r '.saved_objects[0].id')

  # Add the visualization to the dashboard
  echo "Adding visualization to dashboard ${DASH_TITLE}"
  curl -s -k --cacert "$CA_CERT" -u ${ELASTIC_USER}:${ELASTIC_PASSWORD} -X POST "$KIBANA_URL/api/kibana/dashboards/import?force=true" \
    -H "kbn-xsrf: true" \
    -H "Content-Type: application/json" \
    -d "{
      \"objects\": [
        {
          \"type\": \"dashboard\",
          \"id\": \"${DASHBOARD_ID}\",
          \"attributes\": {
            \"title\": \"${DASH_TITLE}\",
            \"panelsJSON\": \"[{\\\"panelIndex\\\":\\\"1\\\",\\\"gridData\\\":{\\\"x\\\":0,\\\"y\\\":0,\\\"w\\\":24,\\\"h\\\":15,\\\"i\\\":\\\"1\\\"},\\\"version\\\":\\\"7.14.0\\\",\\\"type\\\":\\\"visualization\\\",\\\"id\\\":\\\"${VIS_ID}\\\"}]\"
          }
        }
      ]
    }"
done

echo "All dashboards and visualizations have been created successfully!"

/usr/local/bin/docker-entrypoint