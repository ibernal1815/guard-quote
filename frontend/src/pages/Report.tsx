import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import BackgroundWrapper from "../components/BackgroundWrapper";
import styles from "./Report.module.css";

interface QuoteData {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  homeType?: string;
  householdSize?: string;
  deviceCount: string;
  primaryUse: string;
  worksFromHome?: string;
  hasSmartHome: boolean;
  smartHomeDetails?: string;
  currentProtection: string[];
  pastIncidents: boolean;
  incidentDetails?: string;
  onlineActivity?: string;
  technicalComfort: string;
  budget: number;
  securityConcerns?: string;
  urgency?: string;
  preferredContact?: string;
}

// Generate personalized report based on user data
function generateReport(data: QuoteData) {
  const hasAntivirus = data.currentProtection?.includes("antivirus");
  const hasVPN = data.currentProtection?.includes("vpn");
  const hasFirewall = data.currentProtection?.includes("firewall");
  const hasPasswordManager = data.currentProtection?.includes("passwordManager");
  const has2FA = data.currentProtection?.includes("2fa");
  const hasNothing = data.currentProtection?.includes("none") || !data.currentProtection?.length;

  // Calculate security score based on current protection
  let score = 40; // Base score
  if (hasAntivirus) score += 15;
  if (hasVPN) score += 10;
  if (hasFirewall) score += 10;
  if (hasPasswordManager) score += 12;
  if (has2FA) score += 13;
  if (data.technicalComfort === "advanced") score += 5;
  if (data.pastIncidents) score -= 10;
  score = Math.min(100, Math.max(20, score));

  // Determine risk level
  const riskLevel = score >= 80 ? "Low" : score >= 60 ? "Moderate" : score >= 40 ? "High" : "Critical";

  // Generate risks based on missing protection
  const risks: { title: string; desc: string; severity: string }[] = [];

  if (!hasAntivirus) {
    risks.push({
      title: "No Antivirus Protection",
      desc: `Your ${data.deviceCount} devices lack malware protection, leaving them vulnerable to viruses, ransomware, and other threats.`,
      severity: "high",
    });
  }

  if (!hasVPN && (data.worksFromHome === "fulltime" || data.worksFromHome === "sometimes")) {
    risks.push({
      title: "Unsecured Remote Work",
      desc: "Working from home without a VPN exposes your data to interception on public or home networks.",
      severity: "high",
    });
  }

  if (!hasPasswordManager) {
    risks.push({
      title: "Password Vulnerability",
      desc: "Without a password manager, you're likely reusing passwords or using weak ones, making accounts easy targets.",
      severity: "medium",
    });
  }

  if (!has2FA) {
    risks.push({
      title: "Single-Factor Authentication",
      desc: "Accounts protected only by passwords can be compromised through phishing or credential stuffing attacks.",
      severity: "medium",
    });
  }

  if (data.hasSmartHome && !hasFirewall) {
    risks.push({
      title: "Smart Home Exposure",
      desc: `Your smart devices (${data.smartHomeDetails || "IoT devices"}) could be entry points for attackers without network segmentation.`,
      severity: "medium",
    });
  }

  if (data.onlineActivity === "daily" && !hasVPN) {
    risks.push({
      title: "Financial Transaction Risk",
      desc: "Daily online banking/shopping without VPN protection increases exposure to man-in-the-middle attacks.",
      severity: "high",
    });
  }

  if (data.pastIncidents) {
    risks.push({
      title: "Previous Security Incident",
      desc: `Past incident (${data.incidentDetails || "details not specified"}) suggests existing vulnerabilities that need addressing.`,
      severity: "high",
    });
  }

  if (risks.length === 0) {
    risks.push({
      title: "Maintain Vigilance",
      desc: "Your current setup is solid, but cyber threats evolve constantly. Regular updates and awareness training are essential.",
      severity: "low",
    });
  }

  // Generate recommendations based on budget and needs
  const recommendations: { solution: string; benefit: string; cost: string; priority: string }[] = [];
  const monthlyBudget = data.budget || 50;

  // Essential recommendations
  if (!hasAntivirus) {
    if (monthlyBudget >= 100) {
      recommendations.push({
        solution: "Bitdefender Total Security",
        benefit: "Complete antivirus, anti-ransomware, and web protection for all your devices.",
        cost: "$80/year (~$7/mo)",
        priority: "Essential",
      });
    } else {
      recommendations.push({
        solution: "Windows Defender + Malwarebytes Free",
        benefit: "Built-in Windows protection supplemented with on-demand malware scanning.",
        cost: "Free",
        priority: "Essential",
      });
    }
  }

  if (!hasVPN) {
    if (monthlyBudget >= 75) {
      recommendations.push({
        solution: "NordVPN or ExpressVPN",
        benefit: "Enterprise-grade encryption for all internet traffic, especially for remote work.",
        cost: "$12/month",
        priority: data.worksFromHome ? "Essential" : "Recommended",
      });
    } else {
      recommendations.push({
        solution: "ProtonVPN Free Tier",
        benefit: "Basic VPN protection from a trusted privacy-focused provider.",
        cost: "Free",
        priority: "Recommended",
      });
    }
  }

  if (!hasPasswordManager) {
    recommendations.push({
      solution: "Bitwarden",
      benefit: "Generate and store unique, strong passwords for every account securely.",
      cost: monthlyBudget >= 50 ? "$10/year (Premium)" : "Free",
      priority: "Essential",
    });
  }

  if (!has2FA) {
    recommendations.push({
      solution: "Authy or Google Authenticator",
      benefit: "Add a second layer of security to all important accounts.",
      cost: "Free",
      priority: "Essential",
    });
  }

  if (data.hasSmartHome) {
    if (monthlyBudget >= 100) {
      recommendations.push({
        solution: "Firewalla Purple",
        benefit: "Hardware firewall to segment and protect your smart home network.",
        cost: "$319 one-time",
        priority: "Recommended",
      });
    } else {
      recommendations.push({
        solution: "Router Security Settings",
        benefit: "Enable WPA3, create a guest network for IoT devices, update firmware regularly.",
        cost: "Free",
        priority: "Recommended",
      });
    }
  }

  if (data.primaryUse === "family") {
    recommendations.push({
      solution: "Family Safety Controls",
      benefit: "Content filtering and screen time management for children's devices.",
      cost: monthlyBudget >= 75 ? "Included with Norton 360 ($100/yr)" : "Free with OpenDNS Family Shield",
      priority: "Recommended",
    });
  }

  if (monthlyBudget >= 150) {
    recommendations.push({
      solution: "Identity Theft Protection",
      benefit: "Dark web monitoring, credit monitoring, and identity restoration services.",
      cost: "$15-25/month",
      priority: "Enhanced",
    });
  }

  // Budget breakdown based on recommendations
  const budgetBreakdown = [
    { area: "Endpoint Protection", value: hasAntivirus ? 15 : 35 },
    { area: "Network Security", value: hasVPN ? 15 : 25 },
    { area: "Identity & Access", value: hasPasswordManager && has2FA ? 10 : 25 },
    { area: "Monitoring & Response", value: 15 },
  ];

  // Generate summary
  const comfortDescriptor =
    data.technicalComfort === "beginner"
      ? "We've prioritized simple, set-and-forget solutions"
      : data.technicalComfort === "advanced"
        ? "We've included options that give you full control"
        : "We've balanced ease-of-use with configurability";

  const summary = `Based on your ${data.deviceCount} devices, ${data.primaryUse || "general"} usage pattern, and $${monthlyBudget}/month budget, your current security posture is rated as ${riskLevel} Risk (Score: ${score}/100). ${comfortDescriptor}. ${
    risks.length > 1
      ? `We identified ${risks.length} areas requiring attention.`
      : "Your setup is relatively secure with minor improvements suggested."
  }`;

  const nextSteps =
    data.urgency === "urgent"
      ? "Given your urgent timeline: Start with the Essential recommendations immediately. Set up 2FA on all accounts today, install antivirus protection, and configure your VPN within the week."
      : data.urgency === "soon"
        ? "Over the next few weeks: Implement Essential recommendations first, then work through Recommended items. Schedule a follow-up review in 30 days."
        : "At your own pace: Review each recommendation and implement them as time allows. Prioritize items marked Essential, then move to Recommended items.";

  return {
    name: `${data.firstName} ${data.lastName}`,
    email: data.email,
    date: new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }),
    score,
    riskLevel,
    summary,
    risks: risks.slice(0, 4), // Max 4 risks shown
    recommendations: recommendations.slice(0, 5), // Max 5 recommendations
    budgetBreakdown,
    nextSteps,
    monthlyBudget,
  };
}

export default function Report() {
  const navigate = useNavigate();
  const [report, setReport] = useState<ReturnType<typeof generateReport> | null>(null);

  useEffect(() => {
    const storedData = sessionStorage.getItem("quoteData");
    if (storedData) {
      try {
        const quoteData: QuoteData = JSON.parse(storedData);
        const generatedReport = generateReport(quoteData);
        setReport(generatedReport);
      } catch (e) {
        console.error("Failed to parse quote data:", e);
      }
    }
  }, []);

  // Fallback if no data
  if (!report) {
    return (
      <BackgroundWrapper>
        <div className={styles.pageWrapper}>
          <div className={styles.reportContainer}>
            <div className={styles.noData}>
              <h2>No Quote Data Found</h2>
              <p>Please complete the quote form to generate your personalized security report.</p>
              <button
                className={styles.downloadBtn}
                onClick={() => navigate("/quote/individual")}
              >
                Start Quote →
              </button>
            </div>
          </div>
        </div>
      </BackgroundWrapper>
    );
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return "#22c55e";
    if (score >= 60) return "#fdb927";
    if (score >= 40) return "#f97316";
    return "#ef4444";
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high": return "#ef4444";
      case "medium": return "#f97316";
      case "low": return "#22c55e";
      default: return "#888";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "Essential": return "#ef4444";
      case "Recommended": return "#fdb927";
      case "Enhanced": return "#3b82f6";
      default: return "#888";
    }
  };

  return (
    <BackgroundWrapper>
      <div className={styles.pageWrapper}>
        {/* AUTH CTA */}
        <div className={styles.headerActions}>
          <button className={styles.authCtaBtn} onClick={() => navigate("/auth")}>
            Save Report & Create Account →
          </button>
        </div>

        {/* REPORT CONTAINER */}
        <div className={styles.reportContainer}>
          <header className={styles.reportHeader}>
            <h1>Your Personalized Security Report</h1>
            <p>
              <strong>For:</strong> {report.name} &nbsp;•&nbsp;
              <strong>Date:</strong> {report.date}
            </p>
          </header>

          <section className={styles.section}>
            <h2>Executive Summary</h2>
            <p>{report.summary}</p>
          </section>

          <section className={styles.section}>
            <h2>Security Score</h2>
            <div className={styles.scoreBox} style={{ borderColor: getScoreColor(report.score) }}>
              <span style={{ color: getScoreColor(report.score) }}>{report.score}</span>/100
              <div className={styles.riskBadge} style={{ backgroundColor: getScoreColor(report.score) }}>
                {report.riskLevel} Risk
              </div>
            </div>
          </section>

          <section className={styles.section}>
            <h2>Key Risk Findings</h2>
            <div className={styles.riskGrid}>
              {report.risks.map((risk, index) => (
                <div key={index} className={styles.riskCard}>
                  <div className={styles.riskHeader}>
                    <h4>{risk.title}</h4>
                    <span
                      className={styles.severityBadge}
                      style={{ backgroundColor: getSeverityColor(risk.severity) }}
                    >
                      {risk.severity}
                    </span>
                  </div>
                  <p>{risk.desc}</p>
                </div>
              ))}
            </div>
          </section>

          <section className={styles.section}>
            <h2>Recommended Solutions</h2>
            <p className={styles.budgetNote}>
              Based on your ${report.monthlyBudget}/month budget
            </p>
            <div className={styles.solutionGrid}>
              {report.recommendations.map((rec, index) => (
                <div key={index} className={styles.solutionCard}>
                  <div className={styles.solutionHeader}>
                    <h4>{rec.solution}</h4>
                    <span
                      className={styles.priorityBadge}
                      style={{ backgroundColor: getPriorityColor(rec.priority) }}
                    >
                      {rec.priority}
                    </span>
                  </div>
                  <p>{rec.benefit}</p>
                  <span className={styles.costTag}>{rec.cost}</span>
                </div>
              ))}
            </div>
          </section>

          <section className={styles.section}>
            <h2>Suggested Budget Allocation</h2>
            <div className={styles.budgetGrid}>
              {report.budgetBreakdown.map((b, i) => (
                <div key={i} className={styles.budgetItem}>
                  <span>{b.area}</span>
                  <div className={styles.budgetBar}>
                    <div
                      className={styles.budgetFill}
                      style={{ width: `${b.value}%` }}
                    />
                  </div>
                  <span>{b.value}%</span>
                </div>
              ))}
            </div>
          </section>

          <section className={styles.section}>
            <h2>Next Steps</h2>
            <p>{report.nextSteps}</p>
          </section>

          <footer className={styles.downloadFooter}>
            <button className={styles.downloadBtn} onClick={() => window.print()}>
              Print Report
            </button>
            <button
              className={styles.downloadBtn}
              onClick={() => navigate("/quote/individual")}
            >
              Update Answers
            </button>
          </footer>
        </div>
      </div>
    </BackgroundWrapper>
  );
}
