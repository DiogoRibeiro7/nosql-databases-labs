#!/usr/bin/env node

/**
 * Lab 05 – Replica Set Monitoring Utility
 *
 * Features:
 *  - Polls replSetGetStatus at a configurable interval
 *  - Reports primary/secondary state, optime timestamps, and lag
 *  - Watches for election events and member state changes
 *  - Saves metrics to monitor_report.json for later analysis
 *
 * Usage:
 *   node monitor_replication.js            # default 60s monitor
 *   node monitor_replication.js --minutes=5 --interval=5
 */

const { MongoClient } = require('mongodb');
const fs = require('fs');
const path = require('path');
const { REPLICA_SET_NAME, MEMBERS } = require('./setup_replica_set');

const argv = process.argv.slice(2);

function parseArgs() {
  const args = {
    intervalSec: 5,
    minutes: 1,
  };

  argv.forEach(arg => {
    const [key, raw] = arg.split('=');
    if (key === '--interval') {
      args.intervalSec = Number(raw);
    }
    if (key === '--minutes') {
      args.minutes = Number(raw);
    }
    if (key === '--durationSeconds') {
      args.minutes = Number(raw) / 60;
    }
  });

  if (Number.isNaN(args.intervalSec) || args.intervalSec <= 0) {
    args.intervalSec = 5;
  }
  if (Number.isNaN(args.minutes) || args.minutes <= 0) {
    args.minutes = 1;
  }
  return args;
}

function formatLag(primaryOptime, memberOptime) {
  if (!primaryOptime || !memberOptime) {
    return null;
  }
  const lagMs = primaryOptime - memberOptime;
  return Math.max(0, Math.round(lagMs / 1000));
}

async function monitorReplicaSet() {
  const { intervalSec, minutes } = parseArgs();
  const durationMs = minutes * 60 * 1000;
  const intervalMs = intervalSec * 1000;
  const uri = `mongodb://localhost:${MEMBERS[0].port},localhost:${MEMBERS[1].port},localhost:${MEMBERS[2].port}/?replicaSet=${REPLICA_SET_NAME}`;

  const client = new MongoClient(uri);
  await client.connect();

  const adminDb = client.db('admin');
  const metrics = [];
  let electionCount = 0;
  let lastPrimary = null;

  console.log(`Monitoring replica set ${REPLICA_SET_NAME} every ${intervalSec}s for ${minutes} minute(s)...`);

  const monitor = setInterval(async () => {
    try {
      const status = await adminDb.command({ replSetGetStatus: 1 });
      const primary = status.members.find(m => m.stateStr === 'PRIMARY');
      if (primary && primary.name !== lastPrimary) {
        electionCount++;
        lastPrimary = primary.name;
        console.log(`⚡ New primary elected: ${primary.name}`);
      }

      const now = new Date();
      const primaryOptime = primary?.optime?.ts?.getHighBits
        ? primary.optime.ts.getHighBits() * 1000
        : primary?.optimeDate?.getTime();

      const row = {
        timestamp: now.toISOString(),
        primary: primary ? { name: primary.name, optimeDate: primary.optimeDate } : null,
        members: status.members.map(member => {
          const lag = primaryOptime ? formatLag(primaryOptime, member.optimeDate?.getTime()) : null;
          return {
            name: member.name,
            state: member.stateStr,
            health: member.health,
            pingMs: member.pingMs,
            optimeDate: member.optimeDate,
            lastHeartbeat: member.lastHeartbeat,
            lagSeconds: lag,
          };
        }),
      };

      metrics.push(row);
      const lagSummary = row.members
        .filter(m => m.state === 'SECONDARY')
        .map(m => `${m.name}: ${m.lagSeconds ?? 'N/A'}s`)
        .join(', ');
      console.log(`[${now.toLocaleTimeString()}] Primary ${primary?.name ?? 'N/A'} | Lag -> ${lagSummary}`);
    } catch (error) {
      console.error('Monitor error:', error.message);
    }
  }, intervalMs);

  await new Promise(resolve => setTimeout(resolve, durationMs));
  clearInterval(monitor);
  await client.close();

  const report = {
    replicaSet: REPLICA_SET_NAME,
    intervalSec,
    minutes,
    electionCount,
    samples: metrics.length,
    metrics,
  };

  const reportPath = path.join(__dirname, 'monitor_report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`\nMonitoring complete. Report saved to ${reportPath}`);
  console.log(`Elections observed: ${electionCount}`);
  console.log(`Total samples: ${metrics.length}`);
}

if (require.main === module) {
  monitorReplicaSet().catch(error => {
    console.error('Monitoring failed:', error);
    process.exit(1);
  });
}

module.exports = { monitorReplicaSet };
