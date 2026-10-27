#!/bin/bash
DOMAIN="vocalnq"
TOKEN="cdc08172-6703-49c5-a455-aadd95d1ea76"

echo url="https://www.duckdns.org/update?domains=${DOMAIN}&token=${TOKEN}&ip=" | curl -k -s -o ~/duckdns/duck.log -K -
echo "[$(date)] Updated DuckDNS. Result: $(cat ~/duckdns/duck.log)" >> ~/duckdns/cron.log
