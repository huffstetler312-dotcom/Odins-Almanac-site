# Server Logs Directory

This directory contains logs from the Restaurant Intelligence Platform:

- `server-manager.log` - Server manager crash prevention logs
- `error.log` - Application error logs (Winston)
- `combined.log` - All application logs (Winston)

## Log Monitoring Commands

```powershell
# View live server manager logs
.\server-control.ps1 logs

# View specific log files
Get-Content logs\server-manager.log -Tail 50
Get-Content logs\error.log -Tail 50
Get-Content logs\combined.log -Tail 50
```

## Log Retention

- Development: 7 days
- Production: 30-90 days (depending on log type)
- Automatic rotation when files exceed size limits