/**
 * Pi1 Service Management - Control services on Raspberry Pi
 */

const PI_HOST = "192.168.2.70";
const PI_USER = "johnmarston";
const PI_PASS = "481526";

interface ServiceStatus {
  name: string;
  displayName: string;
  type: "systemd" | "docker";
  status: "running" | "stopped" | "error" | "unknown";
  uptime?: string;
  port?: number;
  memory?: string;
  cpu?: string;
}

interface ServiceAction {
  success: boolean;
  message: string;
  output?: string;
}

// Service definitions
const SERVICES = [
  { name: "postgresql", displayName: "PostgreSQL", type: "systemd" as const, port: 5432 },
  { name: "redis-server", displayName: "Redis", type: "systemd" as const, port: 6379 },
  { name: "pgbouncer", displayName: "PgBouncer", type: "systemd" as const, port: 6432 },
  { name: "fail2ban", displayName: "Fail2ban", type: "systemd" as const },
  { name: "ufw", displayName: "UFW Firewall", type: "systemd" as const },
  { name: "prometheus", displayName: "Prometheus", type: "docker" as const, port: 9090 },
  { name: "grafana", displayName: "Grafana", type: "docker" as const, port: 3000 },
  { name: "alertmanager", displayName: "Alertmanager", type: "docker" as const, port: 9093 },
  { name: "node-exporter", displayName: "Node Exporter", type: "docker" as const, port: 9100 },
  { name: "loki", displayName: "Loki", type: "docker" as const, port: 3100 },
  { name: "promtail", displayName: "Promtail", type: "docker" as const },
];

// Execute SSH command on Pi with timeout
async function sshExec(command: string, timeoutMs: number = 5000): Promise<{ stdout: string; stderr: string; exitCode: number }> {
  const proc = Bun.spawn(["sshpass", "-p", PI_PASS, "ssh", "-o", "StrictHostKeyChecking=no", "-o", "ConnectTimeout=3", `${PI_USER}@${PI_HOST}`, command], {
    stdout: "pipe",
    stderr: "pipe",
  });

  // Add timeout
  const timeout = setTimeout(() => proc.kill(), timeoutMs);

  try {
    const stdout = await new Response(proc.stdout).text();
    const stderr = await new Response(proc.stderr).text();
    const exitCode = await proc.exited;
    clearTimeout(timeout);
    return { stdout: stdout.trim(), stderr: stderr.trim(), exitCode };
  } catch (error) {
    clearTimeout(timeout);
    return { stdout: "", stderr: "Command timed out", exitCode: 1 };
  }
}

// Get status of a systemd service
async function getSystemdStatus(serviceName: string): Promise<Partial<ServiceStatus>> {
  const { stdout, exitCode } = await sshExec(`systemctl is-active ${serviceName} 2>/dev/null || echo 'inactive'`);
  const status = stdout === "active" ? "running" : stdout === "inactive" ? "stopped" : "error";

  let uptime = "";
  if (status === "running") {
    const { stdout: uptimeOut } = await sshExec(`systemctl show ${serviceName} --property=ActiveEnterTimestamp --value 2>/dev/null`);
    if (uptimeOut) {
      const startTime = new Date(uptimeOut);
      const now = new Date();
      const diff = now.getTime() - startTime.getTime();
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      uptime = hours > 24 ? `${Math.floor(hours / 24)}d ${hours % 24}h` : `${hours}h ${mins}m`;
    }
  }

  return { status, uptime };
}

// Get status of a Docker container
async function getDockerStatus(containerName: string): Promise<Partial<ServiceStatus>> {
  const { stdout } = await sshExec(`docker inspect --format='{{.State.Status}}' ${containerName} 2>/dev/null || echo 'not_found'`);

  let status: ServiceStatus["status"] = "unknown";
  if (stdout === "running") status = "running";
  else if (stdout === "exited" || stdout === "stopped") status = "stopped";
  else if (stdout === "not_found") status = "stopped";
  else status = "error";

  let uptime = "";
  let memory = "";
  let cpu = "";

  if (status === "running") {
    const { stdout: statsOut } = await sshExec(`docker stats ${containerName} --no-stream --format '{{.UpTime}}|{{.MemUsage}}|{{.CPUPerc}}' 2>/dev/null`);
    if (statsOut) {
      const [up, mem, cpuVal] = statsOut.split("|");
      uptime = up || "";
      memory = mem?.split("/")[0]?.trim() || "";
      cpu = cpuVal || "";
    }
  }

  return { status, uptime, memory, cpu };
}

// Get all service statuses (parallel for speed)
export async function getAllServiceStatuses(): Promise<ServiceStatus[]> {
  // Run all status checks in parallel
  const statusPromises = SERVICES.map(async (svc) => {
    try {
      const statusInfo = svc.type === "systemd"
        ? await getSystemdStatus(svc.name)
        : await getDockerStatus(svc.name);

      return {
        name: svc.name,
        displayName: svc.displayName,
        type: svc.type,
        port: svc.port,
        status: statusInfo.status || "unknown",
        uptime: statusInfo.uptime,
        memory: statusInfo.memory,
        cpu: statusInfo.cpu,
      } as ServiceStatus;
    } catch (error) {
      return {
        name: svc.name,
        displayName: svc.displayName,
        type: svc.type,
        port: svc.port,
        status: "error",
      } as ServiceStatus;
    }
  });

  return Promise.all(statusPromises);
}

// Control a service (start, stop, restart)
export async function controlService(serviceName: string, action: "start" | "stop" | "restart"): Promise<ServiceAction> {
  const svc = SERVICES.find(s => s.name === serviceName);
  if (!svc) {
    return { success: false, message: `Unknown service: ${serviceName}` };
  }

  try {
    let command: string;

    if (svc.type === "systemd") {
      command = `sudo systemctl ${action} ${serviceName}`;
    } else {
      // Docker
      if (action === "restart") {
        command = `docker restart ${serviceName}`;
      } else if (action === "stop") {
        command = `docker stop ${serviceName}`;
      } else {
        command = `docker start ${serviceName}`;
      }
    }

    const { stdout, stderr, exitCode } = await sshExec(command);

    if (exitCode === 0) {
      return {
        success: true,
        message: `${svc.displayName} ${action}ed successfully`,
        output: stdout || stderr
      };
    } else {
      return {
        success: false,
        message: `Failed to ${action} ${svc.displayName}`,
        output: stderr || stdout
      };
    }
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

// Get service logs
export async function getServiceLogs(serviceName: string, lines: number = 50): Promise<{ logs: string; error?: string }> {
  const svc = SERVICES.find(s => s.name === serviceName);
  if (!svc) {
    return { logs: "", error: `Unknown service: ${serviceName}` };
  }

  try {
    let command: string;

    if (svc.type === "systemd") {
      command = `sudo journalctl -u ${serviceName} -n ${lines} --no-pager`;
    } else {
      command = `docker logs ${serviceName} --tail ${lines} 2>&1`;
    }

    const { stdout, stderr, exitCode } = await sshExec(command);

    if (exitCode === 0) {
      return { logs: stdout || stderr };
    } else {
      return { logs: "", error: stderr || stdout };
    }
  } catch (error: any) {
    return { logs: "", error: error.message };
  }
}

// Remediate common issues
export async function remediateService(serviceName: string): Promise<ServiceAction> {
  const svc = SERVICES.find(s => s.name === serviceName);
  if (!svc) {
    return { success: false, message: `Unknown service: ${serviceName}` };
  }

  try {
    const steps: string[] = [];
    let command: string;

    if (svc.type === "systemd") {
      // Systemd remediation: stop, reset failed, start
      command = `
        sudo systemctl stop ${serviceName} 2>/dev/null;
        sudo systemctl reset-failed ${serviceName} 2>/dev/null;
        sudo systemctl start ${serviceName};
        sudo systemctl status ${serviceName} --no-pager
      `;
      steps.push("Stopped service", "Reset failed state", "Started service");
    } else {
      // Docker remediation: stop, remove, recreate from compose
      command = `
        docker stop ${serviceName} 2>/dev/null;
        docker rm ${serviceName} 2>/dev/null;
        cd ~/monitoring && docker-compose up -d ${serviceName};
        docker ps --filter name=${serviceName}
      `;
      steps.push("Stopped container", "Removed container", "Recreated from compose");
    }

    const { stdout, stderr, exitCode } = await sshExec(command);

    return {
      success: exitCode === 0,
      message: exitCode === 0
        ? `Remediation complete: ${steps.join(" → ")}`
        : `Remediation had issues`,
      output: stdout || stderr
    };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

// Get Pi system info
export async function getPiSystemInfo(): Promise<{
  hostname: string;
  uptime: string;
  loadAvg: string;
  memoryUsed: string;
  memoryTotal: string;
  diskUsed: string;
  diskTotal: string;
  cpuTemp: string;
}> {
  const { stdout } = await sshExec(`
    echo "hostname:$(hostname)"
    echo "uptime:$(uptime -p)"
    echo "load:$(cat /proc/loadavg | cut -d' ' -f1-3)"
    echo "mem:$(free -h | awk '/^Mem:/ {print $3 "|" $2}')"
    echo "disk:$(df -h / | awk 'NR==2 {print $3 "|" $2}')"
    echo "temp:$(vcgencmd measure_temp 2>/dev/null | cut -d= -f2 || echo 'N/A')"
  `);

  const lines = stdout.split("\n");
  const data: Record<string, string> = {};

  for (const line of lines) {
    const [key, value] = line.split(":");
    if (key && value) data[key] = value;
  }

  const [memUsed, memTotal] = (data.mem || "|").split("|");
  const [diskUsed, diskTotal] = (data.disk || "|").split("|");

  return {
    hostname: data.hostname || "pi1",
    uptime: data.uptime?.replace("up ", "") || "unknown",
    loadAvg: data.load || "0 0 0",
    memoryUsed: memUsed || "0",
    memoryTotal: memTotal || "0",
    diskUsed: diskUsed || "0",
    diskTotal: diskTotal || "0",
    cpuTemp: data.temp || "N/A",
  };
}

export { SERVICES };
