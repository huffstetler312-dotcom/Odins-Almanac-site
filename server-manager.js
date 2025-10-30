// Server Process Manager - Restaurant Intelligence Platform
// Crash Prevention & Auto-Recovery System
// Viking Restaurant Consultants - Production Reliability

const { spawn, exec } = require('child_process');
const path = require('path');
const fs = require('fs');

class ServerManager {
  constructor() {
    this.serverProcess = null;
    this.restartCount = 0;
    this.maxRestarts = 10;
    this.restartDelay = 5000; // 5 seconds
    this.isShuttingDown = false;
    this.healthCheckInterval = null;
    this.logFile = path.join(__dirname, 'logs', 'server-manager.log');
    
    // Ensure logs directory exists
    this.ensureLogsDirectory();
    
    // Bind context
    this.startServer = this.startServer.bind(this);
    this.stopServer = this.stopServer.bind(this);
    this.restartServer = this.restartServer.bind(this);
    this.healthCheck = this.healthCheck.bind(this);
  }

  ensureLogsDirectory() {
    const logsDir = path.join(__dirname, 'logs');
    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir, { recursive: true });
    }
  }

  log(message, level = 'INFO') {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] [${level}] ${message}\n`;
    
    console.log(`🛡️ Server Manager: ${message}`);
    
    try {
      fs.appendFileSync(this.logFile, logEntry);
    } catch (error) {
      console.error('Failed to write to log file:', error.message);
    }
  }

  startServer() {
    if (this.serverProcess && !this.serverProcess.killed) {
      this.log('Server is already running', 'WARN');
      return;
    }

    if (this.restartCount >= this.maxRestarts) {
      this.log(`Maximum restart attempts (${this.maxRestarts}) reached. Server stopped.`, 'ERROR');
      return;
    }

    this.log(`Starting server (attempt ${this.restartCount + 1}/${this.maxRestarts})`);

    // Determine which server file to use
    const serverFile = fs.existsSync('server.js') ? 'server.js' : 'working-ai-server.js';
    
    this.serverProcess = spawn('node', [serverFile], {
      stdio: ['pipe', 'pipe', 'pipe'],
      cwd: __dirname,
      detached: false
    });

    this.log(`Server started with PID: ${this.serverProcess.pid}`);
    this.restartCount++;

    // Handle server output
    this.serverProcess.stdout.on('data', (data) => {
      const output = data.toString().trim();
      if (output) {
        console.log(`📤 Server: ${output}`);
      }
    });

    this.serverProcess.stderr.on('data', (data) => {
      const error = data.toString().trim();
      if (error) {
        console.error(`❌ Server Error: ${error}`);
        this.log(`Server stderr: ${error}`, 'ERROR');
      }
    });

    // Handle server process events
    this.serverProcess.on('close', (code, signal) => {
      this.log(`Server process closed with code ${code}, signal ${signal}`);
      
      if (!this.isShuttingDown) {
        if (code !== 0) {
          this.log(`Server crashed with exit code ${code}`, 'ERROR');
          this.scheduleRestart();
        } else {
          this.log('Server stopped gracefully');
        }
      }
    });

    this.serverProcess.on('error', (error) => {
      this.log(`Server process error: ${error.message}`, 'ERROR');
      if (!this.isShuttingDown) {
        this.scheduleRestart();
      }
    });

    // Start health checks
    this.startHealthChecks();

    // Reset restart count after successful start
    setTimeout(() => {
      if (this.serverProcess && !this.serverProcess.killed) {
        this.restartCount = Math.max(0, this.restartCount - 1);
      }
    }, 60000); // Reset after 1 minute of successful operation
  }

  scheduleRestart() {
    if (this.isShuttingDown) return;

    this.log(`Scheduling server restart in ${this.restartDelay}ms`);
    
    setTimeout(() => {
      if (!this.isShuttingDown) {
        this.startServer();
      }
    }, this.restartDelay);

    // Increase delay for next restart (exponential backoff)
    this.restartDelay = Math.min(this.restartDelay * 1.5, 30000); // Max 30 seconds
  }

  stopServer(graceful = true) {
    this.isShuttingDown = true;
    
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = null;
    }

    if (this.serverProcess && !this.serverProcess.killed) {
      this.log('Stopping server...');
      
      if (graceful) {
        // Try graceful shutdown first
        this.serverProcess.kill('SIGTERM');
        
        // Force kill after timeout
        setTimeout(() => {
          if (this.serverProcess && !this.serverProcess.killed) {
            this.log('Force killing server process', 'WARN');
            this.serverProcess.kill('SIGKILL');
          }
        }, 10000);
      } else {
        this.serverProcess.kill('SIGKILL');
      }
    }
  }

  restartServer() {
    this.log('Restarting server...');
    this.isShuttingDown = false;
    this.restartDelay = 5000; // Reset delay
    
    if (this.serverProcess && !this.serverProcess.killed) {
      this.serverProcess.once('close', () => {
        setTimeout(() => this.startServer(), 2000);
      });
      this.stopServer();
    } else {
      this.startServer();
    }
  }

  startHealthChecks() {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
    }

    this.healthCheckInterval = setInterval(this.healthCheck, 30000); // Check every 30 seconds
  }

  async healthCheck() {
    if (this.isShuttingDown) return;

    try {
      const { default: fetch } = await import('node-fetch');
      const response = await fetch('http://localhost:3000/health', { 
        timeout: 5000,
        signal: AbortSignal.timeout(5000)
      });
      
      if (!response.ok) {
        throw new Error(`Health check failed: ${response.status} ${response.statusText}`);
      }

      const healthData = await response.json();
      
      // Check memory usage
      if (healthData.memory && healthData.memory.heapUsed) {
        const memoryUsageMB = healthData.memory.heapUsed / 1024 / 1024;
        if (memoryUsageMB > 512) { // 512MB threshold
          this.log(`High memory usage detected: ${memoryUsageMB.toFixed(2)}MB`, 'WARN');
        }
      }

      // Check uptime
      if (healthData.uptime && healthData.uptime < 60) {
        this.log('Server recently restarted, monitoring closely', 'INFO');
      }

    } catch (error) {
      this.log(`Health check failed: ${error.message}`, 'ERROR');
      
      // If health checks fail multiple times, restart the server
      this.healthCheckFailures = (this.healthCheckFailures || 0) + 1;
      
      if (this.healthCheckFailures >= 3) {
        this.log('Multiple health check failures, restarting server', 'WARN');
        this.healthCheckFailures = 0;
        this.restartServer();
      }
    }
  }

  // Status report
  getStatus() {
    return {
      isRunning: this.serverProcess && !this.serverProcess.killed,
      pid: this.serverProcess ? this.serverProcess.pid : null,
      restartCount: this.restartCount,
      maxRestarts: this.maxRestarts,
      isShuttingDown: this.isShuttingDown,
      uptime: this.serverProcess ? process.uptime() : 0
    };
  }
}

// Create global server manager instance
const serverManager = new ServerManager();

// Handle process signals
process.on('SIGTERM', () => {
  serverManager.log('Received SIGTERM, shutting down gracefully');
  serverManager.stopServer();
  setTimeout(() => process.exit(0), 15000);
});

process.on('SIGINT', () => {
  serverManager.log('Received SIGINT (Ctrl+C), shutting down gracefully');
  serverManager.stopServer();
  setTimeout(() => process.exit(0), 15000);
});

process.on('uncaughtException', (error) => {
  serverManager.log(`Uncaught exception in manager: ${error.message}`, 'ERROR');
  console.error(error.stack);
});

process.on('unhandledRejection', (reason, promise) => {
  serverManager.log(`Unhandled rejection: ${reason}`, 'ERROR');
});

// Start the server
console.log(`
🛡️ VIKING SERVER MANAGER - CRASH PROTECTION ACTIVE 🛡️
═══════════════════════════════════════════════════════════
⚔️  Auto-restart on crashes: ENABLED
🔄 Health monitoring: ACTIVE  
📊 Max restart attempts: ${serverManager.maxRestarts}
🚨 Process monitoring: ONLINE
═══════════════════════════════════════════════════════════
`);

serverManager.startServer();

// Export for programmatic control
module.exports = serverManager;