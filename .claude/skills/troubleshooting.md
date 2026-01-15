# GuardQuote Troubleshooting Skill

Use this skill when debugging issues, fixing errors, or diagnosing problems.

## Quick Diagnostics

### Check all services on Pi1
```bash
ssh pi1 "echo '=== System ===' && uptime && echo '' && \
echo '=== Systemd Services ===' && systemctl is-active postgresql redis-server pgbouncer fail2ban pihole-FTL && echo '' && \
echo '=== Docker ===' && docker ps --format 'table {{.Names}}\t{{.Status}}' && echo '' && \
echo '=== Disk ===' && df -h / && echo '' && \
echo '=== Memory ===' && free -h"
```

### Check from dev machine
```bash
# Pi1 reachable?
ping -c 1 192.168.2.70

# PostgreSQL?
psql postgresql://guardquote:WPU8bj3nbwFyZFEtHZQz@192.168.2.70:5432/guardquote -c "SELECT 1"

# DNS?
dig @192.168.2.70 google.com +short

# Redis?
redis-cli -h 192.168.2.70 -a guardquote_redis_2024 ping
```

## Common Issues

### "Connection refused" to PostgreSQL

**Symptoms:** `ECONNREFUSED` or connection timeout

**Fixes:**
1. Check PostgreSQL is running:
   ```bash
   ssh pi1 "systemctl status postgresql"
   ```

2. Check UFW allows your IP:
   ```bash
   ssh pi1 "sudo ufw status | grep 5432"
   # Add if missing:
   ssh pi1 "sudo ufw allow from 192.168.1.0/24 to any port 5432"
   ```

3. Check pg_hba.conf allows your network:
   ```bash
   ssh pi1 "sudo grep -v '^#' /etc/postgresql/15/main/pg_hba.conf | grep -v '^$'"
   # Add if missing:
   ssh pi1 "echo 'host guardquote guardquote 192.168.1.0/24 md5' | sudo tee -a /etc/postgresql/15/main/pg_hba.conf && sudo systemctl reload postgresql"
   ```

### "Password verification failed"

**Symptoms:** Login fails with `UnsupportedAlgorithm` error

**Cause:** Password hash corrupted or wrong format

**Fix:** Regenerate hash using Bun:
```typescript
// In backend/src/services/auth.ts or a script
const hash = await Bun.password.hash('newpassword', 'argon2id');
await sql`UPDATE users SET password_hash = ${hash} WHERE email = 'user@example.com'`;
```

### DNS not working

**Symptoms:** `dig @192.168.2.70 google.com` times out

**Fixes:**
1. Check Pi-hole is running:
   ```bash
   ssh pi1 "pihole status"
   ```

2. Check UFW allows DNS:
   ```bash
   ssh pi1 "sudo ufw status | grep 53"
   # Add if missing:
   ssh pi1 "sudo ufw allow 53/tcp && sudo ufw allow 53/udp"
   ```

3. Check Pi-hole listening mode (must be "ALL" for cross-subnet):
   ```bash
   ssh pi1 "sudo grep listeningMode /etc/pihole/pihole.toml"
   # Change if needed:
   ssh pi1 "sudo sed -i 's/listeningMode = \"LOCAL\"/listeningMode = \"ALL\"/' /etc/pihole/pihole.toml && sudo systemctl restart pihole-FTL"
   ```

### Backend "Port in use" error

**Symptoms:** `EADDRINUSE` on port 3000

**Fix:**
```bash
lsof -ti :3000 | xargs kill -9
```

### Frontend proxy error

**Symptoms:** `socket hang up` or `ECONNREFUSED` in Vite

**Cause:** Backend not running or crashed

**Fix:**
1. Check backend is running: `lsof -i :3000`
2. Restart backend: `cd backend && bun run --watch src/index.ts`

### Docker container won't start

**Symptoms:** Container exits immediately

**Fix:**
```bash
# Check logs
ssh pi1 "docker logs <container_name> 2>&1 | tail -30"

# Recreate container
ssh pi1 "cd ~/monitoring && docker-compose up -d <service_name>"
```

### "Column does not exist" error

**Symptoms:** PostgreSQL error about missing column

**Fix:** Add the missing column:
```bash
ssh pi1 "sudo -u postgres psql guardquote -c 'ALTER TABLE users ADD COLUMN last_login TIMESTAMP;'"
```

Or run Drizzle migration:
```bash
cd backend && bunx drizzle-kit push
```

### Services page slow (30+ seconds)

**Symptoms:** AdminServices page takes forever to load

**Cause:** Sequential SSH calls

**Fix:** Use parallel Promise.all in `pi-services.ts` (already done)

### WebSocket disconnects

**Symptoms:** Live price updates stop working

**Fixes:**
1. Check backend WebSocket is accepting:
   ```bash
   curl -i -N -H "Connection: Upgrade" -H "Upgrade: websocket" -H "Sec-WebSocket-Version: 13" -H "Sec-WebSocket-Key: test" http://localhost:3000/ws
   ```

2. Check browser console for errors
3. Restart backend

## Log Locations

| Service | Location |
|---------|----------|
| Backend | stdout (dev server) |
| PostgreSQL | `ssh pi1 "sudo tail /var/log/postgresql/postgresql-15-main.log"` |
| Pi-hole | `ssh pi1 "sudo tail /var/log/pihole/FTL.log"` |
| Redis | `ssh pi1 "sudo tail /var/log/redis/redis-server.log"` |
| Docker | `ssh pi1 "docker logs <container>"` |
| UFW | `ssh pi1 "sudo tail /var/log/ufw.log"` |

## Network Debugging

### Check what's listening
```bash
ssh pi1 "ss -tlnp | head -20"
```

### Check UFW blocked connections
```bash
ssh pi1 "sudo tail -50 /var/log/ufw.log | grep BLOCK"
```

### Test port connectivity
```bash
nc -zv 192.168.2.70 5432  # PostgreSQL
nc -zv 192.168.2.70 53    # DNS
nc -zv 192.168.2.70 6379  # Redis
```

## Recovery Commands

### Restart all Pi1 services
```bash
ssh pi1 "sudo systemctl restart postgresql redis-server pgbouncer pihole-FTL && cd ~/monitoring && docker-compose restart"
```

### Reset Pi-hole
```bash
ssh pi1 "pihole restartdns"
```

### Clear Redis cache
```bash
ssh pi1 "redis-cli -a guardquote_redis_2024 FLUSHALL"
```

### Reboot Pi1 (last resort)
```bash
ssh pi1 "sudo reboot"
```

---

*Last updated: January 15, 2026*
