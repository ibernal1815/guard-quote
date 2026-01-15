# GuardQuote Monitoring Skill

Use this skill when working with Prometheus, Grafana, or system monitoring.

## Stack Overview

All monitoring runs on Pi1 (192.168.2.70) via Docker.

| Service | Port | Purpose |
|---------|------|---------|
| Prometheus | 9090 | Metrics collection & storage |
| Grafana | 3000 | Visualization dashboards |
| Alertmanager | 9093 | Alert routing & notifications |
| Node Exporter | 9100 | Host system metrics |
| Loki | 3100 | Log aggregation |
| Promtail | - | Log shipping to Loki |
| cAdvisor | 8080 | Container metrics |

## Web UIs

| Service | URL |
|---------|-----|
| Grafana | http://192.168.2.70:3000 |
| Prometheus | http://192.168.2.70:9090 |
| Alertmanager | http://192.168.2.70:9093 |

## Docker Compose

Location: `~/monitoring/docker-compose.yml` on Pi1

### Check container status
```bash
ssh pi1 "docker ps --format 'table {{.Names}}\t{{.Status}}\t{{.Ports}}'"
```

### Restart all monitoring
```bash
ssh pi1 "cd ~/monitoring && docker-compose restart"
```

### Restart specific service
```bash
ssh pi1 "docker restart prometheus"
ssh pi1 "docker restart grafana"
```

### View logs
```bash
ssh pi1 "docker logs prometheus --tail 50"
ssh pi1 "docker logs grafana --tail 50"
```

## Prometheus

### Query metrics
```bash
# Via curl
curl -s "http://192.168.2.70:9090/api/v1/query?query=up"

# Via Prometheus UI
http://192.168.2.70:9090/graph
```

### Common PromQL queries
```promql
# All targets up/down
up

# CPU usage
100 - (avg(rate(node_cpu_seconds_total{mode="idle"}[5m])) * 100)

# Memory usage
(1 - node_memory_MemAvailable_bytes / node_memory_MemTotal_bytes) * 100

# Disk usage
(1 - node_filesystem_avail_bytes{mountpoint="/"} / node_filesystem_size_bytes{mountpoint="/"}) * 100

# Network traffic
rate(node_network_receive_bytes_total{device="eth0"}[5m])
```

### Config file
```bash
ssh pi1 "cat ~/monitoring/prometheus/prometheus.yml"
```

### Reload config (without restart)
```bash
curl -X POST http://192.168.2.70:9090/-/reload
```

## Grafana

### Default credentials
- Username: admin
- Password: (check docker-compose or first login)

### Data sources
- Prometheus: http://prometheus:9090 (internal Docker network)
- Loki: http://loki:3100 (for logs)

### Useful dashboards
Import from grafana.com:
- Node Exporter Full (ID: 1860)
- Docker/Container monitoring (ID: 893)
- PostgreSQL (ID: 9628)

## Alertmanager

### Config file
```bash
ssh pi1 "cat ~/monitoring/alertmanager/alertmanager.yml"
```

### Check alerts
```bash
curl -s http://192.168.2.70:9093/api/v2/alerts | jq
```

## Loki (Logs)

### Query logs via Grafana
1. Go to Grafana → Explore
2. Select Loki data source
3. Use LogQL queries:

```logql
# All logs from a service
{job="docker"} |= "error"

# PostgreSQL logs
{job="postgresql"}

# Filter by time
{job="docker"} | json | ts > "2026-01-15T00:00:00Z"
```

## Node Exporter Metrics

Key metrics available:
- `node_cpu_seconds_total` - CPU usage
- `node_memory_*` - Memory stats
- `node_disk_*` - Disk I/O
- `node_filesystem_*` - Filesystem usage
- `node_network_*` - Network stats
- `node_load*` - System load

### Query from Pi1
```bash
curl -s http://192.168.2.70:9100/metrics | grep -E "^node_memory_MemAvailable"
```

## Troubleshooting

### Container not starting
```bash
ssh pi1 "docker logs <container_name> 2>&1 | tail -20"
```

### Prometheus not scraping
1. Check targets: http://192.168.2.70:9090/targets
2. Verify config: `ssh pi1 "docker exec prometheus cat /etc/prometheus/prometheus.yml"`

### Grafana dashboard not loading
1. Check data source: Settings → Data Sources → Test
2. Check Prometheus is up: http://192.168.2.70:9090/api/v1/query?query=up

### High memory usage
```bash
ssh pi1 "docker stats --no-stream"
```

---

*Last updated: January 15, 2026*
