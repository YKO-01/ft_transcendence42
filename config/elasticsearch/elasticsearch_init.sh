#!/bin/bash

if [ x${ELASTIC_PASSWORD} == x ]; then
    echo "Set the ELASTIC_PASSWORD environment variable in the .env file";
    exit 1;
    elif [ x${KIBANA_PASSWORD} == x ]; then
    echo "Set the KIBANA_PASSWORD environment variable in the .env file";
    exit 1;
fi;
if [ ! -f config/certs/ca.zip ]; then
    echo "Creating CA";
    bin/elasticsearch-certutil ca --silent --pem -out config/certs/ca.zip;
    unzip config/certs/ca.zip -d config/certs;
fi;
if [ ! -f config/certs/certs.zip ]; then
    echo "Creating certs";
    echo -ne \
    "instances:\n"\
    "  - name: elasticsearch\n"\
    "    dns:\n"\
    "      - elasticsearch\n"\
    "      - localhost\n"\
    "    ip:\n"\
    "      - 127.0.0.1\n"\
    "  - name: kibana\n"\
    "    dns:\n"\
    "      - kibana\n"\
    "      - localhost\n"\
    "    ip:\n"\
    "      - 127.0.0.1\n"\
    "  - name: logstash\n"\
    "    dns:\n"\
    "      - logstash\n"\
    "      - localhost\n"\
    "    ip:\n"\
    "      - 127.0.0.1\n"\
    > config/certs/instances.yml;
    bin/elasticsearch-certutil cert --silent --pem -out config/certs/certs.zip --in config/certs/instances.yml --ca-cert config/certs/ca/ca.crt --ca-key config/certs/ca/ca.key;
    unzip config/certs/certs.zip -d config/certs;
fi;
echo "Setting file permissions"
chown -R root:root config/certs;
find . -type d -exec chmod 750 \{\} \;;
find . -type f -exec chmod 640 \{\} \;;
echo "Waiting for Elasticsearch availability";
until curl -s --cacert config/certs/ca/ca.crt https://elasticsearch:9200 | grep -q "missing authentication credentials"; do sleep 30; done;
echo "Setting kibana user password";
until curl -s -X POST --cacert config/certs/ca/ca.crt -u "${ELASTIC_USER}:${ELASTIC_PASSWORD}" -H "Content-Type: application/json" https://elasticsearch:9200/_security/user/${KIBANA_USER}/_password -d "{\"password\":\"${KIBANA_PASSWORD}\"}" | grep -q "^{}"; do sleep 10; done;

# # Apply ILM policy
# echo "Applying ILM policy"
# curl --cacert certs/ca/ca.crt -k -u elastic:${ELASTIC_PASSWORD} -X PUT 'https://elasticsearch:9200/_ilm/policy/logs_lifecycle_policy?pretty' -H 'Content-Type: application/json' -d '{
#   "policy": {
#     "phases": {
#       "hot": {
#         "min_age": "0ms",
#         "actions": {
#           "rollover": {
#             "max_age": "3d",
#             "max_primary_shard_size": "5gb"
#           }
#         }
#       },
#       "warm": {
#         "min_age": "0ms",
#         "actions": {
#           "forcemerge": {
#             "max_num_segments": 1
#           }
#         }
#       },
#       "delete": {
#         "min_age": "3d",
#         "actions": {
#           "delete": {}
#         }
#       }
#   },
# }'

# # Apply Index Template
# echo "Applying Index Template"
# curl --cacert certs/ca/ca.crt -k -u elastic:${ELASTIC_PASSWORD} -X PUT 'https://elasticsearch:9200/_index_template/logs_template?pretty' -H 'Content-Type: application/json' -d '{
#   "index_patterns": ["django-logs-*", "nginx-logs-*", "postgres-logs-*"],
#   "template": {
#     "settings": {
#       "index.lifecycle.name": "logs_lifecycle_policy",
#       "index.lifecycle.rollover_alias": "logs"
#     }
#   }
# }'

# Apply ILM policy
echo "Applying ILM policy"
curl --cacert certs/ca/ca.crt -k -u ${ELASTIC_USER}:${ELASTIC_PASSWORD} -X PUT 'https://elasticsearch:9200/_ilm/policy/logs_lifecycle_policy?pretty' -H 'Content-Type: application/json' -d '{
  "policy": {
    "phases": {
      "delete": {
        "min_age": "30d",
        "actions": {
          "delete": {}
        }
      }
    }
  }
}'

# Apply Index Template
echo "Applying Index Template"
curl --cacert certs/ca/ca.crt -k -u ${ELASTIC_USER}:${ELASTIC_PASSWORD} -X PUT 'https://elasticsearch:9200/_index_template/logs_template?pretty' -H 'Content-Type: application/json' -d '{
  "index_patterns": ["django-logs-*", "nginx-logs-*", "postgres-logs-*"],
  "template": {
    "settings": {
      "index.lifecycle.name": "logs_lifecycle_policy",
      "index.lifecycle.rollover_alias": "logs"
    },
    "mappings": {
      "properties": {
        "@timestamp": {
          "type": "date"
        }
      }
    }
  }
}'


echo "All done!";
