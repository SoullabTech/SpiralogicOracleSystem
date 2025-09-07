#!/bin/bash
# AIN Sovereign Security Firewall Setup
# Hardens system security with UFW and iptables

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging
LOG_FILE="/var/log/ain-security-setup.log"
exec > >(tee -a "${LOG_FILE}")
exec 2>&1

echo -e "${BLUE}🔒 AIN Sovereign Security Setup${NC}"
echo "Timestamp: $(date)"
echo "=============================================="

# Check if running as root
if [[ $EUID -ne 0 ]]; then
   echo -e "${RED}❌ This script must be run as root${NC}"
   exit 1
fi

# Install required packages
echo -e "${YELLOW}📦 Installing security packages...${NC}"
apt-get update && apt-get install -y \
    ufw \
    fail2ban \
    iptables \
    iptables-persistent \
    auditd \
    rkhunter \
    chkrootkit \
    unattended-upgrades \
    logrotate

# Configure UFW
echo -e "${YELLOW}🔥 Configuring UFW firewall...${NC}"

# Reset UFW to defaults
ufw --force reset

# Set default policies
ufw default deny incoming
ufw default allow outgoing
ufw default deny forward

# Allow SSH (with rate limiting)
ufw limit ssh/tcp comment 'SSH with rate limiting'

# Allow HTTP and HTTPS
ufw allow 80/tcp comment 'HTTP for Let\'s Encrypt'
ufw allow 443/tcp comment 'HTTPS'
ufw allow 443/udp comment 'HTTPS HTTP/3'

# Allow AIN specific ports
ufw allow 7000:7005/tcp comment 'AIN Elemental Agents gRPC'
ufw allow 8080/tcp comment 'AIN Backend API'

# Allow monitoring (restrict to local network)
ufw allow from 172.20.0.0/16 to any port 9090 comment 'Prometheus (local network only)'
ufw allow from 172.20.0.0/16 to any port 3001 comment 'Grafana (local network only)'

# Allow database connections (restrict to containers)
ufw allow from 172.20.0.0/16 to any port 5432 comment 'PostgreSQL (containers only)'
ufw allow from 172.20.0.0/16 to any port 6379 comment 'Redis (containers only)'

# IPFS ports (for sovereign operation)
ufw allow 4001/tcp comment 'IPFS P2P'
ufw allow 5001/tcp comment 'IPFS API (local)'

# Enable UFW
ufw --force enable

echo -e "${GREEN}✅ UFW firewall configured${NC}"

# Configure fail2ban
echo -e "${YELLOW}🛡️  Configuring fail2ban...${NC}"

cat > /etc/fail2ban/jail.local << 'EOF'
[DEFAULT]
bantime = 1h
findtime = 10m
maxretry = 3
backend = systemd

[sshd]
enabled = true
port = ssh
filter = sshd
logpath = %(sshd_log)s
bantime = 24h
maxretry = 3

[nginx-http-auth]
enabled = true
filter = nginx-http-auth
logpath = /var/log/nginx/error.log
maxretry = 3

[nginx-limit-req]
enabled = true
filter = nginx-limit-req
logpath = /var/log/nginx/error.log
maxretry = 5

[ain-api-abuse]
enabled = true
filter = ain-api-abuse
logpath = /app/logs/api.log
maxretry = 10
bantime = 1h

[docker-logs]
enabled = true
filter = docker-logs
logpath = /var/lib/docker/containers/*/*.log
maxretry = 5
EOF

# Create custom fail2ban filter for AIN API abuse
cat > /etc/fail2ban/filter.d/ain-api-abuse.conf << 'EOF'
[Definition]
failregex = ^.*\[AIN-API-ABUSE\].*<HOST>.*$
ignoreregex =
EOF

# Create custom fail2ban filter for Docker logs
cat > /etc/fail2ban/filter.d/docker-logs.conf << 'EOF'
[Definition]
failregex = ^.*\[ERROR\].*failed.*<HOST>.*$
            ^.*\[WARN\].*suspicious.*<HOST>.*$
ignoreregex =
EOF

systemctl enable fail2ban
systemctl restart fail2ban

echo -e "${GREEN}✅ fail2ban configured${NC}"

# Configure auditd
echo -e "${YELLOW}🔍 Configuring auditd...${NC}"

cat >> /etc/audit/rules.d/ain-security.rules << 'EOF'
# AIN Security Audit Rules

# Monitor file access to sensitive directories
-w /app/data -p wa -k ain_data_access
-w /app/logs -p wa -k ain_logs_access
-w /etc/ssh/sshd_config -p wa -k ssh_config_change
-w /etc/passwd -p wa -k passwd_changes
-w /etc/group -p wa -k group_changes
-w /etc/shadow -p wa -k shadow_changes

# Monitor network connections
-a always,exit -F arch=b64 -S socket -F a0=2 -k network_socket_creation
-a always,exit -F arch=b32 -S socket -F a0=2 -k network_socket_creation

# Monitor process execution
-a always,exit -F arch=b64 -S execve -k process_execution
-a always,exit -F arch=b32 -S execve -k process_execution

# Monitor privilege escalation
-w /bin/su -p x -k privilege_escalation
-w /usr/bin/sudo -p x -k privilege_escalation
-w /etc/sudoers -p wa -k sudoers_changes

# Monitor Docker events
-w /var/lib/docker -p wa -k docker_changes
-w /etc/docker -p wa -k docker_config_changes
EOF

systemctl enable auditd
systemctl restart auditd

echo -e "${GREEN}✅ auditd configured${NC}"

# Configure automatic security updates
echo -e "${YELLOW}🔄 Configuring automatic security updates...${NC}"

cat > /etc/apt/apt.conf.d/20auto-upgrades << 'EOF'
APT::Periodic::Update-Package-Lists "1";
APT::Periodic::Download-Upgradeable-Packages "1";
APT::Periodic::AutocleanInterval "7";
APT::Periodic::Unattended-Upgrade "1";
EOF

cat > /etc/apt/apt.conf.d/50unattended-upgrades << 'EOF'
Unattended-Upgrade::Allowed-Origins {
    "${distro_id}:${distro_codename}-security";
    "${distro_id} ESMApps:${distro_codename}-apps-security";
    "${distro_id} ESM:${distro_codename}-infra-security";
};

Unattended-Upgrade::Package-Blacklist {
    // Add packages that should not be automatically updated
};

Unattended-Upgrade::AutoFixInterruptedDpkg "true";
Unattended-Upgrade::MinimalSteps "true";
Unattended-Upgrade::Remove-Unused-Dependencies "true";
Unattended-Upgrade::Automatic-Reboot "false";
Unattended-Upgrade::SyslogEnable "true";
EOF

systemctl enable unattended-upgrades
systemctl start unattended-upgrades

echo -e "${GREEN}✅ Automatic security updates configured${NC}"

# Configure log rotation
echo -e "${YELLOW}📋 Configuring log rotation...${NC}"

cat > /etc/logrotate.d/ain-logs << 'EOF'
/app/logs/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    create 644 ain ain
    postrotate
        /usr/bin/docker kill -s USR1 $(docker ps -q --filter "name=ain") 2>/dev/null || true
    endscript
}

/var/log/ain-security-setup.log {
    weekly
    missingok
    rotate 12
    compress
    delaycompress
    notifempty
    create 644 root root
}
EOF

echo -e "${GREEN}✅ Log rotation configured${NC}"

# Create security monitoring script
echo -e "${YELLOW}👁️  Creating security monitoring script...${NC}"

cat > /usr/local/bin/ain-security-monitor.sh << 'EOF'
#!/bin/bash
# AIN Security Monitoring Script

LOG_FILE="/var/log/ain-security-monitor.log"

# Function to log with timestamp
log_with_timestamp() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1" >> "${LOG_FILE}"
}

# Check for suspicious network connections
check_network() {
    SUSPICIOUS_CONNECTIONS=$(netstat -tulpn | grep -E ":(22|80|443|7000|7001|7002|7003|7004|7005|8080|9090)" | wc -l)
    if [[ $SUSPICIOUS_CONNECTIONS -gt 50 ]]; then
        log_with_timestamp "WARNING: High number of network connections detected: $SUSPICIOUS_CONNECTIONS"
    fi
}

# Check Docker container health
check_docker_health() {
    UNHEALTHY_CONTAINERS=$(docker ps --filter "health=unhealthy" -q | wc -l)
    if [[ $UNHEALTHY_CONTAINERS -gt 0 ]]; then
        log_with_timestamp "WARNING: $UNHEALTHY_CONTAINERS unhealthy Docker containers detected"
    fi
}

# Check disk usage
check_disk_usage() {
    DISK_USAGE=$(df / | awk 'NR==2 {print $5}' | sed 's/%//')
    if [[ $DISK_USAGE -gt 85 ]]; then
        log_with_timestamp "WARNING: Disk usage is at ${DISK_USAGE}%"
    fi
}

# Check memory usage
check_memory() {
    MEMORY_USAGE=$(free | awk 'FNR==2{printf "%.0f", $3/($3+$4)*100}')
    if [[ $MEMORY_USAGE -gt 90 ]]; then
        log_with_timestamp "WARNING: Memory usage is at ${MEMORY_USAGE}%"
    fi
}

# Run all checks
log_with_timestamp "Starting security monitoring check"
check_network
check_docker_health
check_disk_usage
check_memory
log_with_timestamp "Security monitoring check completed"
EOF

chmod +x /usr/local/bin/ain-security-monitor.sh

# Add to crontab
(crontab -l 2>/dev/null; echo "*/15 * * * * /usr/local/bin/ain-security-monitor.sh") | crontab -

echo -e "${GREEN}✅ Security monitoring configured${NC}"

# Final security hardening
echo -e "${YELLOW}🔐 Applying final security hardening...${NC}"

# Disable unnecessary services
systemctl disable bluetooth 2>/dev/null || true
systemctl disable cups 2>/dev/null || true
systemctl disable avahi-daemon 2>/dev/null || true

# Set proper file permissions
chmod 700 /root
chmod 644 /etc/passwd
chmod 644 /etc/group
chmod 640 /etc/shadow

# Configure kernel parameters for security
cat >> /etc/sysctl.d/99-ain-security.conf << 'EOF'
# AIN Security Kernel Parameters

# Network security
net.ipv4.tcp_syncookies = 1
net.ipv4.ip_forward = 0
net.ipv4.conf.all.send_redirects = 0
net.ipv4.conf.default.send_redirects = 0
net.ipv4.conf.all.accept_redirects = 0
net.ipv4.conf.default.accept_redirects = 0
net.ipv4.conf.all.accept_source_route = 0
net.ipv4.conf.default.accept_source_route = 0
net.ipv4.conf.all.log_martians = 1
net.ipv4.conf.default.log_martians = 1
net.ipv4.icmp_echo_ignore_broadcasts = 1
net.ipv4.icmp_ignore_bogus_error_responses = 1

# Memory protection
kernel.dmesg_restrict = 1
kernel.kptr_restrict = 2
kernel.yama.ptrace_scope = 1
EOF

sysctl -p /etc/sysctl.d/99-ain-security.conf

echo -e "${GREEN}✅ Final security hardening applied${NC}"

# Display summary
echo -e "${BLUE}=============================================="
echo -e "🎉 AIN Sovereign Security Setup Complete!"
echo -e "=============================================="
echo -e "✅ UFW firewall configured and enabled"
echo -e "✅ fail2ban configured for intrusion prevention"
echo -e "✅ auditd configured for security monitoring"
echo -e "✅ Automatic security updates enabled"
echo -e "✅ Log rotation configured"
echo -e "✅ Security monitoring script installed"
echo -e "✅ System hardening applied"
echo -e ""
echo -e "🔍 Security Status:"
ufw status numbered
echo -e ""
echo -e "📋 Next steps:"
echo -e "  1. Review firewall rules: ufw status"
echo -e "  2. Monitor logs: tail -f /var/log/ain-security-setup.log"
echo -e "  3. Check fail2ban: fail2ban-client status"
echo -e "  4. Review audit logs: ausearch -k ain_data_access"
echo -e ""
echo -e "🚀 Your AIN system is now sovereignly secured!"
echo -e "${NC}"