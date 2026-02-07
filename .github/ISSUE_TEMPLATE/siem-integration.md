---
name: SIEM Integration Task
about: Wazuh SIEM integration setup
title: "[SIEM] Wazuh Agent Integration"
labels: siem, infrastructure, priority-high
assignees: ''
---

## Overview

Set up Wazuh SIEM integration between GuardQuote infrastructure and Isaiah's Wazuh manager.

## Prerequisites

- [ ] Isaiah's Wazuh manager deployed and accessible
- [ ] Tailscale network connectivity verified
- [ ] Agent registration keys generated

## Required Information from Isaiah

| Item | Value | Status |
|------|-------|--------|
| Wazuh Manager Address | `isaiah-wazuh.ts.net` | ⏳ Pending |
| pi0 Agent Key | `MDAxIHBp...` | ⏳ Pending |
| pi1 Agent Key | `MDAxIHBp...` | ⏳ Pending |
| Tailscale Hostname | `???` | ⏳ Pending |

## Tasks

### Isaiah's Side
- [ ] Install Wazuh manager
- [ ] Join Tailscale network
- [ ] Generate agent registration keys
- [ ] Share credentials with team

### Our Side
- [ ] Verify Tailscale connectivity to manager
- [ ] Deploy Wazuh agent on pi0
- [ ] Deploy Wazuh agent on pi1
- [ ] Verify agent registration
- [ ] Test log forwarding
- [ ] Configure Vector backup (if needed)

## Resources

- **Setup Guide**: `docs/SIEM-SETUP-ISAIAH.md`
- **Install Script**: `~/.openclaw/workspace/scripts/wazuh-agent-install.sh`
- **Data Pipeline Diagram**: `/admin/network` → Data Pipeline tab

## Notes

Vector is already configured as a backup log collector on pi0, sending to Loki. Wazuh agents will provide additional security features:
- File Integrity Monitoring
- Rootkit Detection
- Vulnerability Scanning
- Compliance Checks
