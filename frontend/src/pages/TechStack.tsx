import { Shield, Server, Database, Cloud, Cpu, Zap, Globe, Lock, ArrowRight, Activity, BarChart3 } from "lucide-react";

const techStack = {
  frontend: {
    title: "Frontend",
    icon: Globe,
    color: "text-blue-400",
    items: [
      { name: "React 18", desc: "UI framework with concurrent features" },
      { name: "TypeScript", desc: "Type-safe development" },
      { name: "Vite", desc: "Lightning-fast build tool" },
      { name: "TailwindCSS", desc: "Utility-first styling" },
      { name: "React Router 7", desc: "Client-side navigation" },
      { name: "Lucide Icons", desc: "Beautiful icon set" },
    ]
  },
  edge: {
    title: "Edge & CDN",
    icon: Cloud,
    color: "text-orange-400",
    items: [
      { name: "Cloudflare Pages", desc: "Global static hosting" },
      { name: "Cloudflare Workers", desc: "Edge API gateway" },
      { name: "Cloudflare Tunnel", desc: "Secure origin connection" },
      { name: "Zero Trust Access", desc: "Identity-aware protection" },
    ]
  },
  backend: {
    title: "Backend API",
    icon: Server,
    color: "text-green-400",
    items: [
      { name: "Node.js 22", desc: "Primary runtime (LTS)" },
      { name: "Hono", desc: "Ultrafast web framework" },
      { name: "dd-trace", desc: "Datadog APM auto-instrumentation" },
      { name: "RFC 7807", desc: "Standard error responses" },
      { name: "jose", desc: "JWT signing & verification" },
    ]
  },
  data: {
    title: "Data Layer",
    icon: Database,
    color: "text-purple-400",
    items: [
      { name: "PostgreSQL 16", desc: "Primary database" },
      { name: "pg (node-postgres)", desc: "Native driver with APM tracing" },
      { name: "bcrypt", desc: "Password hashing" },
      { name: "Zod", desc: "Runtime validation" },
    ]
  },
  observability: {
    title: "Observability",
    icon: Activity,
    color: "text-cyan-400",
    items: [
      { name: "Datadog APM", desc: "Distributed tracing & metrics" },
      { name: "Grafana", desc: "Dashboards & visualization" },
      { name: "Prometheus", desc: "Metrics collection" },
      { name: "Loki", desc: "Log aggregation" },
      { name: "Vector", desc: "Log shipping pipeline" },
    ]
  },
  infra: {
    title: "Infrastructure",
    icon: Cpu,
    color: "text-pink-400",
    items: [
      { name: "Raspberry Pi 4/5", desc: "ARM64 compute cluster" },
      { name: "Ubuntu 25.10", desc: "Server OS" },
      { name: "Docker Compose", desc: "Container orchestration" },
      { name: "systemd", desc: "Native service management" },
      { name: "Tailscale", desc: "Mesh VPN overlay" },
    ]
  },
  security: {
    title: "Security",
    icon: Lock,
    color: "text-red-400",
    items: [
      { name: "Cloudflare Access", desc: "Zero Trust auth" },
      { name: "OpenLDAP", desc: "Centralized identity" },
      { name: "bcrypt", desc: "Password hashing (cost=10)" },
      { name: "JWT (HS256)", desc: "Stateless sessions" },
      { name: "CORS", desc: "Cross-origin protection" },
    ]
  }
};

const benchmarks = [
  { 
    label: "API Response Time", 
    desc: "P95 latency under load (ms)",
    data: [
      { name: "Node.js + Hono", value: 47, color: "bg-green-500" },
      { name: "Node.js + Express", value: 89, color: "bg-yellow-500" },
      { name: "Deno + Hono", value: 52, color: "bg-blue-500" },
    ]
  },
  {
    label: "APM Overhead",
    desc: "Latency impact of tracing (%)",
    data: [
      { name: "dd-trace (Node.js)", value: 3, color: "bg-green-500" },
      { name: "OpenTelemetry", value: 8, color: "bg-yellow-500" },
      { name: "Manual spans", value: 15, color: "bg-orange-500" },
    ]
  }
];

const architecture = `
┌─────────────────────────────────────────────────────────────┐
│                    CLOUDFLARE EDGE                          │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐ │
│  │    Pages    │  │   Worker    │  │   Cloudflare Tunnel │ │
│  │  (React)    │  │ (API Proxy) │  │  (Secure Connect)   │ │
│  └──────┬──────┘  └──────┬──────┘  └──────────┬──────────┘ │
└─────────┼────────────────┼─────────────────────┼───────────┘
          │                │                     │
          └────────────────┴─────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────┐
│                     HOME LAB (Matrix)                        │
│                                                              │
│  ┌────────────────┐              ┌────────────────────────┐ │
│  │      pi1       │              │         pi0            │ │
│  │  (Services)    │◄─Tailscale──►│     (Monitoring)       │ │
│  ├────────────────┤              ├────────────────────────┤ │
│  │ ┌────────────┐ │              │ ┌────────────────────┐ │ │
│  │ │ Node.js    │ │              │ │ Grafana/Prometheus │ │ │
│  │ │ + dd-trace │─┼──────────────┼─► Loki + Vector      │ │ │
│  │ └─────┬──────┘ │              │ └────────────────────┘ │ │
│  │       │        │              │ ┌────────────────────┐ │ │
│  │ ┌─────▼──────┐ │              │ │    OpenLDAP        │ │ │
│  │ │ PostgreSQL │ │              │ │    (Identity)      │ │ │
│  │ └────────────┘ │              │ └────────────────────┘ │ │
│  └────────────────┘              └────────────────────────┘ │
│                           │                                  │
│                    ┌──────▼──────┐                          │
│                    │   Datadog   │                          │
│                    │   (Cloud)   │                          │
│                    └─────────────┘                          │
└──────────────────────────────────────────────────────────────┘
`;

export default function TechStack() {
  return (
    <div className="py-16 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-block mb-4 px-4 py-1.5 bg-accent/20 rounded text-accent text-xs font-mono font-medium tracking-wider">
            INFRASTRUCTURE
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Tech Stack</h1>
          <p className="text-zinc-400 max-w-2xl mx-auto">
            Built on modern, battle-tested technologies. Self-hosted on Raspberry Pi cluster, 
            globally distributed via Cloudflare's edge network, monitored with Datadog APM.
          </p>
        </div>

        {/* Architecture Diagram */}
        <div className="mb-16 p-6 bg-zinc-900 border border-zinc-800 rounded-xl overflow-x-auto">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Zap className="w-5 h-5 text-accent" />
            Architecture Overview
          </h2>
          <pre className="text-xs md:text-sm text-zinc-400 font-mono leading-relaxed whitespace-pre">
            {architecture}
          </pre>
        </div>

        {/* Tech Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {Object.entries(techStack).map(([key, category]) => (
            <div key={key} className="p-6 bg-zinc-900 border border-zinc-800 rounded-xl hover:border-zinc-700 transition-colors">
              <div className="flex items-center gap-3 mb-4">
                <category.icon className={`w-6 h-6 ${category.color}`} />
                <h3 className="text-lg font-semibold">{category.title}</h3>
              </div>
              <ul className="space-y-3">
                {category.items.map((item, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <ArrowRight className="w-4 h-4 text-zinc-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="text-zinc-200 font-medium">{item.name}</span>
                      <span className="text-zinc-500 text-sm ml-2">— {item.desc}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* APM Highlight */}
        <div className="mb-16 p-6 bg-gradient-to-r from-purple-900/20 to-blue-900/20 border border-purple-800/30 rounded-xl">
          <div className="flex items-start gap-4">
            <BarChart3 className="w-8 h-8 text-purple-400 flex-shrink-0" />
            <div>
              <h3 className="text-xl font-semibold mb-2">Full-Stack Observability</h3>
              <p className="text-zinc-400 mb-4">
                Every request is traced end-to-end with Datadog APM. Native <code className="text-purple-300 bg-purple-900/30 px-1 rounded">dd-trace</code> auto-instrumentation 
                captures HTTP, PostgreSQL, bcrypt, and DNS spans with zero manual code.
              </p>
              <div className="flex flex-wrap gap-3 text-sm">
                <span className="px-3 py-1 bg-zinc-800 rounded-full text-zinc-300">68+ spans/request</span>
                <span className="px-3 py-1 bg-zinc-800 rounded-full text-zinc-300">3% overhead</span>
                <span className="px-3 py-1 bg-zinc-800 rounded-full text-zinc-300">15-month retention</span>
              </div>
            </div>
          </div>
        </div>

        {/* Benchmarks */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold mb-8 text-center">Performance Benchmarks</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {benchmarks.map((benchmark, i) => (
              <div key={i} className="p-6 bg-zinc-900 border border-zinc-800 rounded-xl">
                <h3 className="text-lg font-semibold mb-1">{benchmark.label}</h3>
                <p className="text-sm text-zinc-500 mb-4">{benchmark.desc}</p>
                <div className="space-y-3">
                  {benchmark.data.map((item, j) => (
                    <div key={j}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-zinc-300">{item.name}</span>
                        <span className="text-zinc-400">{item.value}{benchmark.label.includes('%') || benchmark.desc.includes('%') ? '%' : 'ms'}</span>
                      </div>
                      <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${item.color} rounded-full transition-all`}
                          style={{ width: `${(item.value / Math.max(...benchmark.data.map(d => d.value))) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Key Decisions */}
        <div className="p-8 bg-gradient-to-br from-zinc-900 to-zinc-950 border border-zinc-800 rounded-xl">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
            <Shield className="w-6 h-6 text-accent" />
            Key Architecture Decisions
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-accent mb-2">Why Node.js over Deno?</h4>
              <p className="text-sm text-zinc-400">
                Native Datadog APM support via <code className="text-accent">dd-trace</code>. Deno's OpenTelemetry 
                required manual span creation; Node.js auto-instruments PostgreSQL, HTTP, bcrypt, and 60+ libraries.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-accent mb-2">Why Cloudflare Pages?</h4>
              <p className="text-sm text-zinc-400">
                Global CDN with edge functions, automatic SSL, and seamless integration 
                with Workers for API proxying. Zero cold starts for static assets.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-accent mb-2">Why Self-Hosted Backend?</h4>
              <p className="text-sm text-zinc-400">
                Full control over data, PostgreSQL with custom ML models, and no vendor 
                lock-in. Cloudflare Tunnel provides secure, NAT-traversing connectivity.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-accent mb-2">Why Dual Observability?</h4>
              <p className="text-sm text-zinc-400">
                Datadog for cloud APM + alerting; Grafana/Prometheus/Loki for local dashboards. 
                Vector dual-writes logs to both, ensuring no single point of failure.
              </p>
            </div>
          </div>
        </div>

        {/* Migration Note */}
        <div className="mt-8 p-4 bg-zinc-900/50 border border-zinc-800 rounded-lg text-sm text-zinc-500">
          <strong className="text-zinc-400">Migration Note:</strong> Originally built on Deno 2.6, migrated to Node.js 22 
          in February 2026 for native APM support. Hono framework retained for API compatibility.
        </div>

        {/* Footer */}
        <div className="mt-12 text-center text-sm text-zinc-600">
          <p>
            Built with ❤️ by the <a href="https://vandine.us" className="text-accent hover:underline">Vandine</a> infrastructure team
          </p>
          <p className="mt-1">
            Last updated: February 2026
          </p>
        </div>
      </div>
    </div>
  );
}
