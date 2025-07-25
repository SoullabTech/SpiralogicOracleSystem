# AIN Sovereign NixOS Configuration
# Ultra-secure, reproducible deployment for consciousness evolution

{ config, lib, pkgs, ... }:

{
  imports = [
    ./hardware-configuration.nix
    ./networking.nix
  ];

  # =====================================
  # SYSTEM CONFIGURATION
  # =====================================
  
  system.stateVersion = "23.11";
  
  # Enable flakes and new nix command
  nix.settings.experimental-features = [ "nix-command" "flakes" ];
  
  # Automatic garbage collection
  nix.gc = {
    automatic = true;
    dates = "weekly";
    options = "--delete-older-than 30d";
  };

  # =====================================
  # BOOT AND KERNEL
  # =====================================
  
  boot = {
    # Use latest LTS kernel for stability
    kernelPackages = pkgs.linuxPackages;
    
    # Security kernel parameters
    kernel.sysctl = {
      # Network security
      "net.ipv4.tcp_syncookies" = 1;
      "net.ipv4.ip_forward" = 0;
      "net.ipv4.conf.all.send_redirects" = 0;
      "net.ipv4.conf.default.send_redirects" = 0;
      "net.ipv4.conf.all.accept_redirects" = 0;
      "net.ipv4.conf.default.accept_redirects" = 0;
      "net.ipv4.conf.all.accept_source_route" = 0;
      "net.ipv4.conf.default.accept_source_route" = 0;
      "net.ipv4.conf.all.log_martians" = 1;
      "net.ipv4.conf.default.log_martians" = 1;
      "net.ipv4.icmp_echo_ignore_broadcasts" = 1;
      "net.ipv4.icmp_ignore_bogus_error_responses" = 1;
      
      # Memory protection
      "kernel.dmesg_restrict" = 1;
      "kernel.kptr_restrict" = 2;
      "kernel.yama.ptrace_scope" = 1;
      
      # File system security
      "fs.protected_hardlinks" = 1;
      "fs.protected_symlinks" = 1;
    };
    
    # Enable AppArmor
    kernelParams = [ "apparmor=1" "security=apparmor" ];
    
    loader = {
      systemd-boot.enable = true;
      efi.canTouchEfiVariables = true;
      # Secure boot (uncomment if hardware supports it)
      # systemd-boot.secureBoot = true;
    };
  };

  # =====================================
  # SECURITY CONFIGURATION
  # =====================================
  
  security = {
    # Enable AppArmor
    apparmor = {
      enable = true;
      killUnconfinedConfinables = true;
    };
    
    # Audit system
    audit = {
      enable = true;
      rules = [
        # Monitor file access to sensitive directories
        "-w /opt/ain -p wa -k ain_access"
        "-w /var/lib/docker -p wa -k docker_access"
        "-w /etc/nixos -p wa -k nixos_config_change"
        
        # Monitor network connections
        "-a always,exit -F arch=b64 -S socket -F a0=2 -k network_socket"
        "-a always,exit -F arch=b32 -S socket -F a0=2 -k network_socket"
        
        # Monitor privilege escalation
        "-w /bin/su -p x -k privilege_escalation"
        "-w /usr/bin/sudo -p x -k privilege_escalation"
      ];
    };
    
    # Sudo configuration
    sudo = {
      enable = true;
      execWheelOnly = true;
      wheelNeedsPassword = true;
    };
    
    # PAM configuration
    pam = {
      loginLimits = [
        { domain = "@wheel"; item = "nofile"; type = "soft"; value = "65536"; }
        { domain = "@wheel"; item = "nofile"; type = "hard"; value = "65536"; }
        { domain = "*"; item = "maxlogins"; type = "hard"; value = "10"; }
      ];
      
      services = {
        login.failDelay = 3000000; # 3 seconds
        sshd.failDelay = 3000000;
      };
    };
  };

  # =====================================
  # USER MANAGEMENT
  # =====================================
  
  users = {
    # Disable root login
    users.root.hashedPassword = "!";
    
    # Create AIN service user
    users.ain = {
      isSystemUser = true;
      group = "ain";
      home = "/opt/ain";
      createHome = true;
      shell = pkgs.bash;
    };
    
    groups.ain = {};
    
    # Create admin user
    users.admin = {
      isNormalUser = true;
      extraGroups = [ "wheel" "docker" "systemd-journal" ];
      openssh.authorizedKeys.keys = [
        # Add your SSH public key here
        # "ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAI... your-key@your-machine"
      ];
    };
    
    # Disable password login for all users
    users.admin.hashedPassword = null;
    users.admin.password = null;
  };

  # =====================================
  # NETWORKING
  # =====================================
  
  networking = {
    hostName = "ain-sovereign";
    
    # Firewall configuration
    firewall = {
      enable = true;
      defaultPolicy = {
        input = "DROP";
        forward = "DROP";
        output = "ACCEPT";
      };
      
      allowedTCPPorts = [ 22 80 443 7000 7001 7002 7003 7004 7005 8080 ];
      allowedUDPPorts = [ 443 ]; # HTTP/3
      
      # Rate limiting for SSH
      extraCommands = ''
        # Rate limit SSH connections
        iptables -A INPUT -p tcp --dport 22 -m conntrack --ctstate NEW -m recent --set --name ssh
        iptables -A INPUT -p tcp --dport 22 -m conntrack --ctstate NEW -m recent --update --seconds 60 --hitcount 3 --name ssh -j DROP
        
        # Allow related and established connections
        iptables -A INPUT -m conntrack --ctstate RELATED,ESTABLISHED -j ACCEPT
        
        # Allow loopback
        iptables -A INPUT -i lo -j ACCEPT
        
        # Drop invalid packets
        iptables -A INPUT -m conntrack --ctstate INVALID -j DROP
      '';
    };
    
    # Disable IPv6 if not needed
    enableIPv6 = false;
    
    # DNS configuration
    nameservers = [ "1.1.1.1" "8.8.8.8" ];
  };

  # =====================================
  # SERVICES CONFIGURATION
  # =====================================
  
  services = {
    # SSH configuration
    openssh = {
      enable = true;
      settings = {
        PermitRootLogin = "no";
        PasswordAuthentication = false;
        PubkeyAuthentication = true;
        AuthenticationMethods = "publickey";
        ClientAliveInterval = 300;
        ClientAliveCountMax = 2;
        MaxAuthTries = 3;
        MaxSessions = 5;
        Protocol = 2;
        X11Forwarding = false;
        AllowTcpForwarding = false;
        GatewayPorts = false;
        PermitTunnel = false;
      };
      
      # Change default SSH port for additional security
      ports = [ 22 ];
      
      # Host keys
      hostKeys = [
        {
          path = "/etc/ssh/ssh_host_ed25519_key";
          type = "ed25519";
        }
        {
          path = "/etc/ssh/ssh_host_rsa_key";
          type = "rsa";
          bits = 4096;
        }
      ];
    };
    
    # Fail2ban for intrusion prevention
    fail2ban = {
      enable = true;
      maxretry = 3;
      bantime = "1h";
      bantime-increment = {
        enable = true;
        formula = "ban.Time * (1<<(ban.Count if ban.Count<20 else 20)) * banFactor";
        maxtime = "168h"; # 1 week
      };
      
      jails = {
        # SSH protection
        sshd = {
          settings = {
            enabled = true;
            port = "ssh";
            filter = "sshd";
            logpath = "/var/log/auth.log";
            maxretry = 3;
            bantime = "24h";
          };
        };
        
        # Nginx protection
        nginx-http-auth = {
          settings = {
            enabled = true;
            filter = "nginx-http-auth";
            logpath = "/var/log/nginx/error.log";
            maxretry = 3;
          };
        };
        
        # Custom AIN API protection
        ain-api = {
          settings = {
            enabled = true;
            filter = "ain-api";
            logpath = "/opt/ain/logs/api.log";
            maxretry = 10;
            findtime = "10m";
            bantime = "1h";
          };
        };
      };
    };
    
    # Automatic updates
    system-update = {
      enable = true;
      dates = "04:00";
      randomizedDelaySec = "30min";
    };
    
    # Log rotation
    logrotate = {
      enable = true;
      settings = {
        "/opt/ain/logs/*.log" = {
          daily = true;
          rotate = 30;
          compress = true;
          delaycompress = true;
          missingok = true;
          notifempty = true;
          postrotate = "systemctl reload docker";
        };
      };
    };
    
    # Prometheus monitoring
    prometheus = {
      enable = true;
      port = 9090;
      listenAddress = "127.0.0.1";
      
      scrapeConfigs = [
        {
          job_name = "ain-system";
          static_configs = [
            {
              targets = [ "localhost:9100" ]; # Node exporter
            }
          ];
        }
        {
          job_name = "ain-services";
          static_configs = [
            {
              targets = [ 
                "localhost:8080"  # AIN API
                "localhost:7000"  # Fire agent
                "localhost:7001"  # Water agent
                "localhost:7002"  # Earth agent
                "localhost:7003"  # Air agent
                "localhost:7004"  # Aether agent
              ];
            }
          ];
        }
      ];
    };
    
    # Node exporter for system metrics
    prometheus.exporters.node = {
      enable = true;
      port = 9100;
      listenAddress = "127.0.0.1";
      enabledCollectors = [
        "systemd"
        "processes"
        "network_route"
        "filesystem"
        "diskstats"
        "meminfo"
        "loadavg"
      ];
    };
    
    # Nginx reverse proxy
    nginx = {
      enable = true;
      recommendedGzipSettings = true;
      recommendedOptimisation = true;
      recommendedProxySettings = true;
      recommendedTlsSettings = true;
      
      # Security headers
      commonHttpConfig = ''
        # Security headers
        add_header X-Content-Type-Options nosniff;
        add_header X-Frame-Options DENY;
        add_header X-XSS-Protection "1; mode=block";
        add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload";
        add_header Referrer-Policy strict-origin-when-cross-origin;
        
        # Hide nginx version
        server_tokens off;
        
        # Rate limiting
        limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
        limit_req_zone $binary_remote_addr zone=login:10m rate=1r/s;
      '';
      
      virtualHosts = {
        "default" = {
          default = true;
          locations."/" = {
            return = "444"; # Close connection without response
          };
        };
        
        # Add your domain configuration here
        # "your-domain.com" = {
        #   enableACME = true;
        #   forceSSL = true;
        #   locations = {
        #     "/" = {
        #       proxyPass = "http://127.0.0.1:3000";
        #       extraConfig = ''
        #         limit_req zone=api burst=20 nodelay;
        #       '';
        #     };
        #     "/api/" = {
        #       proxyPass = "http://127.0.0.1:8080";
        #       extraConfig = ''
        #         limit_req zone=api burst=10 nodelay;
        #       '';
        #     };
        #   };
        # };
      };
    };
    
    # Let's Encrypt certificates
    # acme = {
    #   acceptTerms = true;
    #   defaults.email = "admin@your-domain.com";
    # };
  };

  # =====================================
  # DOCKER CONFIGURATION
  # =====================================
  
  virtualisation.docker = {
    enable = true;
    daemon.settings = {
      # Security settings
      live-restore = false;
      userland-proxy = false;
      no-new-privileges = true;
      
      # Logging
      log-driver = "json-file";
      log-opts = {
        max-size = "100m";
        max-file = "3";
      };
      
      # Resource limits
      default-ulimits = {
        nofile = {
          hard = 65536;
          soft = 65536;
        };
        nproc = {
          hard = 4096;
          soft = 4096;
        };
      };
      
      # Security options
      seccomp-profile = "/etc/docker/seccomp.json";
      apparmor-profile = "docker-default";
    };
    
    # Enable rootless mode for additional security
    rootless = {
      enable = true;
      setSocketVariable = true;
    };
  };

  # =====================================
  # ENVIRONMENT AND PACKAGES
  # =====================================
  
  environment = {
    systemPackages = with pkgs; [
      # System utilities
      htop
      iotop
      curl
      wget
      git
      vim
      tmux
      jq
      
      # Security tools
      nmap
      tcpdump
      wireshark-cli
      rkhunter
      chkrootkit
      
      # Docker tools
      docker
      docker-compose
      
      # Monitoring
      prometheus
      grafana
      
      # Backup tools
      restic
      borgbackup
      gnupg
      
      # Network tools
      dig
      netcat
      iperf3
      
      # Development tools (if needed)
      nodejs
      python3
      go
    ];
    
    # Global environment variables
    variables = {
      EDITOR = "vim";
      BROWSER = "firefox";
      AIN_ENV = "production";
      SECURITY_MODE = "sovereign";
    };
  };

  # =====================================
  # SYSTEMD SERVICES
  # =====================================
  
  systemd = {
    # AIN backup service
    services.ain-backup = {
      description = "AIN Sovereign Backup Service";
      after = [ "docker.service" ];
      wants = [ "docker.service" ];
      
      serviceConfig = {
        Type = "oneshot";
        User = "root";
        ExecStart = "${pkgs.bash}/bin/bash /opt/ain/scripts/backup.sh";
        EnvironmentFile = "/opt/ain/.env.sovereign";
      };
    };
    
    # AIN backup timer (daily at 2 AM)
    timers.ain-backup = {
      description = "AIN Sovereign Backup Timer";
      wantedBy = [ "timers.target" ];
      
      timerConfig = {
        OnCalendar = "daily";
        Persistent = true;
        RandomizedDelaySec = "30min";
      };
    };
    
    # Security monitoring service
    services.ain-security-monitor = {
      description = "AIN Security Monitoring Service";
      after = [ "network.target" ];
      wantedBy = [ "multi-user.target" ];
      
      serviceConfig = {
        Type = "simple";
        User = "root";
        ExecStart = "${pkgs.bash}/bin/bash /opt/ain/scripts/security-monitor.sh";
        Restart = "always";
        RestartSec = 300;
      };
    };
    
    # Docker health check service
    services.docker-health = {
      description = "Docker Container Health Monitor";
      after = [ "docker.service" ];
      wants = [ "docker.service" ];
      
      serviceConfig = {
        Type = "simple";
        ExecStart = "${pkgs.bash}/bin/bash -c 'while true; do docker stats --no-stream --format \"table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}\" >> /var/log/docker-health.log; sleep 60; done'";
        Restart = "always";
        RestartSec = 10;
      };
    };
  };

  # =====================================
  # FILE SYSTEM
  # =====================================
  
  fileSystems = {
    # Secure mount options
    "/" = {
      options = [ "noatime" "nodiratime" ];
    };
    
    "/tmp" = {
      device = "tmpfs";
      fsType = "tmpfs";
      options = [ "noatime" "nosuid" "nodev" "noexec" "size=2G" ];
    };
    
    "/opt/ain" = {
      options = [ "noatime" "nodiratime" "nosuid" "nodev" ];
    };
  };

  # =====================================
  # HARDWARE OPTIMIZATIONS
  # =====================================
  
  hardware = {
    # Enable all firmware
    enableAllFirmware = true;
    
    # CPU microcode updates
    cpu.intel.updateMicrocode = true;
    cpu.amd.updateMicrocode = true;
  };

  # Power management
  powerManagement = {
    enable = true;
    cpuFreqGovernor = "performance"; # For servers
  };

  # =====================================
  # LOCALIZATION
  # =====================================
  
  time.timeZone = "UTC";
  
  i18n = {
    defaultLocale = "en_US.UTF-8";
    supportedLocales = [ "en_US.UTF-8/UTF-8" ];
  };

  # =====================================
  # ADDITIONAL SECURITY
  # =====================================
  
  # Disable unnecessary services
  systemd.services = {
    # Disable if not needed
    bluetooth.enable = lib.mkForce false;
    cups.enable = lib.mkForce false;
    avahi-daemon.enable = lib.mkForce false;
  };
  
  # Kernel hardening
  boot.kernelParams = [
    # Disable legacy protocols
    "ipv6.disable=1"
    "net.ipv4.conf.all.send_redirects=0"
    "net.ipv4.conf.default.send_redirects=0"
    
    # Memory protection
    "slub_debug=P"
    "page_poison=1"
    "vsyscall=none"
    
    # Disable unused features
    "bluetooth.disable_ertm=Y"
    "bluetooth.disable_esco=Y"
  ];
  
  # Restrict access to kernel logs
  boot.kernel.sysctl."kernel.dmesg_restrict" = 1;
  
  # Disable core dumps
  systemd.coredump.enable = false;
  security.pam.loginLimits = [
    { domain = "*"; item = "core"; type = "hard"; value = "0"; }
  ];
}