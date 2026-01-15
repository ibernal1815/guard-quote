import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { getAuthHeaders } from "../../context/AuthContext";
import styles from "./AdminServices.module.css";

interface Service {
  name: string;
  displayName: string;
  type: "systemd" | "docker";
  status: "running" | "stopped" | "error" | "unknown";
  uptime?: string;
  port?: number;
  memory?: string;
  cpu?: string;
}

interface SystemInfo {
  hostname: string;
  uptime: string;
  loadAvg: string;
  memoryUsed: string;
  memoryTotal: string;
  diskUsed: string;
  diskTotal: string;
  cpuTemp: string;
}

export default function AdminServices() {
  const navigate = useNavigate();
  const [services, setServices] = useState<Service[]>([]);
  const [systemInfo, setSystemInfo] = useState<SystemInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);
  const [logs, setLogs] = useState<{ service: string; content: string } | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const fetchServices = useCallback(async () => {
    try {
      const [servicesRes, systemRes] = await Promise.all([
        fetch("/api/admin/services", { headers: getAuthHeaders() }),
        fetch("/api/admin/services/system", { headers: getAuthHeaders() }),
      ]);

      if (!servicesRes.ok || !systemRes.ok) {
        if (servicesRes.status === 401 || systemRes.status === 401) {
          navigate("/admin/login");
          return;
        }
        throw new Error("Failed to fetch services");
      }

      setServices(await servicesRes.json());
      setSystemInfo(await systemRes.json());
      setError("");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    fetchServices();
    const interval = setInterval(fetchServices, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, [fetchServices]);

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const handleAction = async (serviceName: string, action: "start" | "stop" | "restart" | "remediate") => {
    setActionInProgress(`${serviceName}-${action}`);

    try {
      const url = action === "remediate"
        ? `/api/admin/services/${serviceName}/remediate`
        : `/api/admin/services/${serviceName}/${action}`;

      const res = await fetch(url, {
        method: "POST",
        headers: getAuthHeaders(),
      });

      const result = await res.json();

      if (result.success) {
        showToast(result.message, "success");
        await fetchServices();
      } else {
        showToast(result.message || "Action failed", "error");
      }
    } catch (err: any) {
      showToast(err.message, "error");
    } finally {
      setActionInProgress(null);
    }
  };

  const handleViewLogs = async (serviceName: string) => {
    try {
      const res = await fetch(`/api/admin/services/${serviceName}/logs?lines=100`, {
        headers: getAuthHeaders(),
      });
      const data = await res.json();

      if (data.error) {
        showToast(data.error, "error");
      } else {
        setLogs({ service: serviceName, content: data.logs });
      }
    } catch (err: any) {
      showToast(err.message, "error");
    }
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case "running": return styles.statusRunning;
      case "stopped": return styles.statusStopped;
      case "error": return styles.statusError;
      default: return styles.statusUnknown;
    }
  };

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
        <p>Loading services...</p>
      </div>
    );
  }

  const runningCount = services.filter(s => s.status === "running").length;
  const stoppedCount = services.filter(s => s.status === "stopped").length;
  const errorCount = services.filter(s => s.status === "error").length;

  return (
    <div className={styles.container}>
      {/* Toast Notification */}
      {toast && (
        <div className={`${styles.toast} ${styles[toast.type]}`}>
          {toast.message}
        </div>
      )}

      <div className={styles.header}>
        <div>
          <h1>Service Management</h1>
          <p>Monitor and control Pi1 services</p>
        </div>
        <button className={styles.refreshBtn} onClick={fetchServices}>
          Refresh
        </button>
      </div>

      {error && (
        <div className={styles.errorBanner}>
          {error}
          <button onClick={() => setError("")}>×</button>
        </div>
      )}

      {/* System Overview */}
      {systemInfo && (
        <div className={styles.systemCard}>
          <div className={styles.systemHeader}>
            <span className={styles.hostname}>{systemInfo.hostname}</span>
            <span className={styles.uptime}>up {systemInfo.uptime}</span>
          </div>
          <div className={styles.systemStats}>
            <div className={styles.stat}>
              <span className={styles.statLabel}>Load</span>
              <span className={styles.statValue}>{systemInfo.loadAvg}</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statLabel}>Memory</span>
              <span className={styles.statValue}>{systemInfo.memoryUsed} / {systemInfo.memoryTotal}</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statLabel}>Disk</span>
              <span className={styles.statValue}>{systemInfo.diskUsed} / {systemInfo.diskTotal}</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statLabel}>Temp</span>
              <span className={styles.statValue}>{systemInfo.cpuTemp}</span>
            </div>
          </div>
        </div>
      )}

      {/* Service Summary */}
      <div className={styles.summary}>
        <div className={`${styles.summaryItem} ${styles.running}`}>
          <span className={styles.summaryCount}>{runningCount}</span>
          <span className={styles.summaryLabel}>Running</span>
        </div>
        <div className={`${styles.summaryItem} ${styles.stopped}`}>
          <span className={styles.summaryCount}>{stoppedCount}</span>
          <span className={styles.summaryLabel}>Stopped</span>
        </div>
        <div className={`${styles.summaryItem} ${styles.error}`}>
          <span className={styles.summaryCount}>{errorCount}</span>
          <span className={styles.summaryLabel}>Error</span>
        </div>
      </div>

      {/* Services Grid */}
      <div className={styles.servicesGrid}>
        {services.map((service) => (
          <div key={service.name} className={styles.serviceCard}>
            <div className={styles.serviceHeader}>
              <div className={styles.serviceInfo}>
                <span className={styles.serviceName}>{service.displayName}</span>
                <span className={styles.serviceType}>{service.type}</span>
              </div>
              <div className={`${styles.statusBadge} ${getStatusClass(service.status)}`}>
                {service.status}
              </div>
            </div>

            <div className={styles.serviceDetails}>
              {service.port && (
                <div className={styles.detail}>
                  <span>Port:</span> {service.port}
                </div>
              )}
              {service.uptime && (
                <div className={styles.detail}>
                  <span>Uptime:</span> {service.uptime}
                </div>
              )}
              {service.memory && (
                <div className={styles.detail}>
                  <span>Memory:</span> {service.memory}
                </div>
              )}
              {service.cpu && (
                <div className={styles.detail}>
                  <span>CPU:</span> {service.cpu}
                </div>
              )}
            </div>

            <div className={styles.serviceActions}>
              {service.status === "running" ? (
                <>
                  <button
                    className={`${styles.actionBtn} ${styles.restartBtn}`}
                    onClick={() => handleAction(service.name, "restart")}
                    disabled={actionInProgress !== null}
                  >
                    {actionInProgress === `${service.name}-restart` ? "..." : "Restart"}
                  </button>
                  <button
                    className={`${styles.actionBtn} ${styles.stopBtn}`}
                    onClick={() => handleAction(service.name, "stop")}
                    disabled={actionInProgress !== null}
                  >
                    {actionInProgress === `${service.name}-stop` ? "..." : "Stop"}
                  </button>
                </>
              ) : (
                <button
                  className={`${styles.actionBtn} ${styles.startBtn}`}
                  onClick={() => handleAction(service.name, "start")}
                  disabled={actionInProgress !== null}
                >
                  {actionInProgress === `${service.name}-start` ? "..." : "Start"}
                </button>
              )}
              <button
                className={`${styles.actionBtn} ${styles.logsBtn}`}
                onClick={() => handleViewLogs(service.name)}
              >
                Logs
              </button>
              {service.status === "error" && (
                <button
                  className={`${styles.actionBtn} ${styles.remediateBtn}`}
                  onClick={() => handleAction(service.name, "remediate")}
                  disabled={actionInProgress !== null}
                >
                  {actionInProgress === `${service.name}-remediate` ? "..." : "Fix"}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Logs Modal */}
      {logs && (
        <div className={styles.modalOverlay} onClick={() => setLogs(null)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>Logs: {logs.service}</h2>
              <button className={styles.closeBtn} onClick={() => setLogs(null)}>×</button>
            </div>
            <pre className={styles.logsContent}>{logs.content || "No logs available"}</pre>
          </div>
        </div>
      )}
    </div>
  );
}
