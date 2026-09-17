import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  PieChart, 
  Pie, 
  Cell, 
  RadarChart, 
  Radar, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  AreaChart, 
  Area, 
  ReferenceLine 
} from 'recharts';
import { 
  Database, 
  ShieldCheck, 
  ShieldAlert, 
  HardDrive, 
  Server, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  RefreshCw, 
  Lock, 
  Unlock, 
  Cpu, 
  Activity, 
  Radio, 
  Key, 
  Zap, 
  Check, 
  X, 
  Layers, 
  ArrowUpRight,
  Clock,
  Wifi,
  WifiOff
} from 'lucide-react';
import { QuestionPaper } from '../types';

interface NodeSimulationState {
  id: string;
  name: string;
  vaultPath: string;
  zone: string;
  role: string;
  isOffline: boolean;
  baseAvailability: number; // percentage e.g. 99.98
  baseLatencyMs: number;
  diskUsageGb: number;
  capacityGb: number;
}

const INITIAL_NODES: NodeSimulationState[] = [
  {
    id: 'node-alpha',
    name: 'Vault Alpha (Node 1)',
    vaultPath: '/var/sec-storage/vault-alpha',
    zone: 'East Bunker (Tier IV DC)',
    role: 'Fragment 1 (Ciphertext Head & 96-bit IV)',
    isOffline: false,
    baseAvailability: 99.99,
    baseLatencyMs: 14,
    diskUsageGb: 412,
    capacityGb: 2000,
  },
  {
    id: 'node-beta',
    name: 'Vault Beta (Node 2)',
    vaultPath: '/var/sec-storage/vault-beta',
    zone: 'Central Isolated Enclave',
    role: 'Fragment 2 (Ciphertext Body & Shamir Shares)',
    isOffline: false,
    baseAvailability: 99.95,
    baseLatencyMs: 22,
    diskUsageGb: 680,
    capacityGb: 2000,
  },
  {
    id: 'node-gamma',
    name: 'Vault Gamma (Node 3)',
    vaultPath: '/var/sec-storage/vault-gamma',
    zone: 'Air-Gapped Vault West',
    role: 'Fragment 3 (Ciphertext Tail & GCM Auth Tag)',
    isOffline: false,
    baseAvailability: 99.98,
    baseLatencyMs: 19,
    diskUsageGb: 395,
    capacityGb: 2000,
  },
  {
    id: 'node-delta',
    name: 'Vault Delta (Node 4)',
    vaultPath: '/var/sec-storage/vault-delta',
    zone: 'HSM Cryptographic Notary North',
    role: 'Digital Signatures & RSA-2048 Root Seals',
    isOffline: false,
    baseAvailability: 99.92,
    baseLatencyMs: 16,
    diskUsageGb: 210,
    capacityGb: 1000,
  },
  {
    id: 'node-epsilon',
    name: 'Vault Epsilon (Node 5)',
    vaultPath: '/var/sec-storage/vault-epsilon',
    zone: 'Disaster Recovery Cloud Replica South',
    role: 'Immutable SIEM Audit Log & Merkle Notary',
    isOffline: false,
    baseAvailability: 100.0,
    baseLatencyMs: 38,
    diskUsageGb: 540,
    capacityGb: 3000,
  },
];

// Telemetry heartbeat time-series data
const LATENCY_SERIES = [
  { epoch: 'T - 55m', alpha: 14, beta: 21, gamma: 19, delta: 15, epsilon: 36 },
  { epoch: 'T - 45m', alpha: 15, beta: 23, gamma: 18, delta: 16, epsilon: 39 },
  { epoch: 'T - 35m', alpha: 13, beta: 20, gamma: 20, delta: 15, epsilon: 37 },
  { epoch: 'T - 25m', alpha: 14, beta: 25, gamma: 19, delta: 17, epsilon: 41 },
  { epoch: 'T - 15m', alpha: 16, beta: 22, gamma: 21, delta: 15, epsilon: 38 },
  { epoch: 'T - 5m', alpha: 14, beta: 22, gamma: 19, delta: 16, epsilon: 37 },
  { epoch: 'Current', alpha: 14, beta: 24, gamma: 19, delta: 16, epsilon: 38 },
];

export const VaultIntegrityDashboard: React.FC = () => {
  const { 
    papers, 
    examinations, 
    toggleThresholdShare, 
    tamperFragment, 
    restoreFragment,
    serverTime,
    currentUser,
    switchRole
  } = useApp();

  const [selectedPaperId, setSelectedPaperId] = useState<string>(papers[0]?.id || 'qp-001');
  const [nodesState, setNodesState] = useState<NodeSimulationState[]>(INITIAL_NODES);
  const [refreshSeed, setRefreshSeed] = useState(0);

  const selectedPaper: QuestionPaper | undefined = papers.find(p => p.id === selectedPaperId) || papers[0];
  const selectedExam = examinations.find(e => e.id === selectedPaper?.examinationId);

  // Toggle storage node simulated offline / maintenance state
  const handleToggleNodeOffline = (nodeId: string) => {
    setNodesState(prev => prev.map(n => {
      if (n.id === nodeId) {
        return { ...n, isOffline: !n.isOffline };
      }
      return n;
    }));
  };

  // Node health calculations
  const onlineNodesCount = nodesState.filter(n => !n.isOffline).length;
  const totalNodesCount = nodesState.length;

  // Fragment state from the selected paper
  const fragments = selectedPaper?.fragments || [];
  const corruptedFragmentsCount = fragments.filter(f => f.isCorrupted).length;
  const isFragmentsAllHealthy = fragments.length > 0 && corruptedFragmentsCount === 0;

  // 3-of-5 Threshold calculation
  const thresholdShares = selectedPaper?.thresholdShares || [];
  const approvedSharesCount = thresholdShares.filter(s => s.approved).length;
  const isQuorumSatisfied = approvedSharesCount >= 3;
  const quorumDeficit = Math.max(0, 3 - approvedSharesCount);

  // Are storage nodes ready for reassembly?
  // Stores 1, 2, 3 correspond to Node Alpha, Beta, Gamma
  const isAlphaOnline = !nodesState.find(n => n.id === 'node-alpha')?.isOffline;
  const isBetaOnline = !nodesState.find(n => n.id === 'node-beta')?.isOffline;
  const isGammaOnline = !nodesState.find(n => n.id === 'node-gamma')?.isOffline;
  const areCoreVaultsAvailable = isAlphaOnline && isBetaOnline && isGammaOnline;

  const canReassemble = isQuorumSatisfied && isFragmentsAllHealthy && areCoreVaultsAvailable;

  // Data for Recharts: Custodian Quorum Synchronization Bar Chart
  const custodianChartData = useMemo(() => {
    return thresholdShares.map(share => ({
      name: `S${share.shareIndex}: ${share.holderTitle.split(' ')[0]}`,
      fullName: share.holderTitle,
      role: share.holderRole,
      approvedVal: share.approved ? 1 : 0,
      pendingVal: share.approved ? 0 : 1,
      status: share.approved ? 'Approved' : 'Pending',
      hasToken: !!share.signatureToken,
    }));
  }, [thresholdShares]);

  // Data for Recharts: Quorum Progress Donut
  const quorumDonutData = useMemo(() => {
    return [
      { name: 'Approved Custodians', value: approvedSharesCount, color: '#059669' },
      { name: 'Pending Custodians', value: 5 - approvedSharesCount, color: '#e5e5ea' },
    ];
  }, [approvedSharesCount]);

  // Data for Recharts: Node Availability Bar Chart
  const nodeAvailabilityData = useMemo(() => {
    return nodesState.map((node, index) => {
      // Check if this node stores a fragment that is corrupted
      const fragIndex = index + 1;
      const frag = fragments.find(f => f.fragmentNumber === fragIndex);
      const isCorrupted = frag?.isCorrupted;

      let effectiveAvailability = node.isOffline ? 0 : node.baseAvailability;
      if (isCorrupted && !node.isOffline) {
        effectiveAvailability = 72.4; // dropped due to integrity mismatch
      }

      return {
        name: node.name.split(' (')[0],
        nodeId: node.id,
        availability: effectiveAvailability,
        slaTarget: 99.90,
        status: node.isOffline ? 'OFFLINE' : isCorrupted ? 'CORRUPTED' : 'HEALTHY',
        latency: node.isOffline ? 0 : node.baseLatencyMs,
        storagePct: Math.round((node.diskUsageGb / node.capacityGb) * 100),
      };
    });
  }, [nodesState, fragments, refreshSeed]);

  // Data for Recharts: Node Resilience Multi-Vector Radar Chart
  const radarMetricsData = useMemo(() => {
    const avgAvail = onlineNodesCount / totalNodesCount * 100;
    const quorumScore = (approvedSharesCount / 5) * 100;
    const fragIntegrityScore = fragments.length ? ((fragments.length - corruptedFragmentsCount) / fragments.length) * 100 : 100;
    const latencyHealth = onlineNodesCount === 5 ? 96 : onlineNodesCount === 4 ? 78 : 45;
    const replicationHealth = areCoreVaultsAvailable ? 100 : 50;

    return [
      { subject: 'Cluster Uptime', score: Math.round(avgAvail), fullMark: 100 },
      { subject: '3/5 Quorum', score: Math.round(quorumScore), fullMark: 100 },
      { subject: 'SHA-256 Parity', score: Math.round(fragIntegrityScore), fullMark: 100 },
      { subject: 'Sync Latency', score: Math.round(latencyHealth), fullMark: 100 },
      { subject: 'Core Vaults SLA', score: Math.round(replicationHealth), fullMark: 100 },
    ];
  }, [onlineNodesCount, totalNodesCount, approvedSharesCount, fragments, corruptedFragmentsCount, areCoreVaultsAvailable]);

  // Handle fragment tamper / restore actions
  const handleToggleFragmentTamper = (fragmentNumber: number, isCurrentlyCorrupted: boolean) => {
    if (!selectedPaper) return;
    if (isCurrentlyCorrupted) {
      restoreFragment(selectedPaper.id, fragmentNumber);
    } else {
      tamperFragment(selectedPaper.id, fragmentNumber);
    }
    setRefreshSeed(s => s + 1);
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header Banner */}
      <div className="bg-white rounded-xl p-6 border border-[#e5e5ea] shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-[#222222] flex items-center justify-center text-white shadow-sm border border-[#333333]">
              <Database className="w-5 h-5 text-[#e95d2a]" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-xl font-extrabold text-[#222222] tracking-tight">
                  Vault Integrity & Quorum Synchronization Dashboard
                </h1>
                <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-[#fef3ee] text-[#e95d2a] border border-[#fde2d4]">
                  RECHARTS TELEMETRY
                </span>
              </div>
              <p className="text-xs text-[#6b7280]">
                Real-time cryptographic audit • 3-of-5 threshold synchronization • Multi-vault storage node availability & SLA
              </p>
            </div>
          </div>

          {/* Paper Selector & Clock */}
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <label className="text-xs font-bold text-[#222222] whitespace-nowrap">Active Paper:</label>
              <select
                value={selectedPaperId}
                onChange={e => setSelectedPaperId(e.target.value)}
                className="px-3 py-1.5 border border-[#e5e5ea] rounded-lg text-xs bg-[#f4f4f6] font-bold text-[#222222] focus:ring-2 focus:ring-[#e95d2a] focus:outline-none cursor-pointer"
              >
                {papers.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.examCode} ({p.id}) - {p.sealed ? 'Sealed' : 'Draft'}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={() => setRefreshSeed(s => s + 1)}
              className="p-2 rounded-lg bg-[#f4f4f6] hover:bg-[#e5e5ea] text-[#6b7280] hover:text-[#222222] transition border border-[#e5e5ea]"
              title="Refresh Telemetry Metrics"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Global Security Status Strip */}
        <div className="mt-4 pt-4 border-t border-[#e5e5ea] grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div>
            <span className="text-[10px] font-bold text-[#6b7280] block uppercase">Threshold Quorum Status</span>
            <span className={`inline-flex items-center font-bold ${
              isQuorumSatisfied ? 'text-[#059669]' : 'text-[#e95d2a]'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                isQuorumSatisfied ? 'bg-[#10b981]' : 'bg-[#e95d2a] animate-pulse'
              }`}></span>
              {isQuorumSatisfied ? `QUORUM ACTIVE (${approvedSharesCount}/5)` : `DEFICIT: NEED ${quorumDeficit} MORE`}
            </span>
          </div>

          <div>
            <span className="text-[10px] font-bold text-[#6b7280] block uppercase">Node Cluster Health</span>
            <span className={`inline-flex items-center font-bold ${
              onlineNodesCount === 5 ? 'text-[#059669]' : 'text-[#e95d2a]'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                onlineNodesCount === 5 ? 'bg-[#10b981]' : 'bg-[#e95d2a]'
              }`}></span>
              {onlineNodesCount} of 5 Nodes Online ({Math.round(onlineNodesCount / 5 * 100)}%)
            </span>
          </div>

          <div>
            <span className="text-[10px] font-bold text-[#6b7280] block uppercase">Split-Storage Parity</span>
            <span className={`inline-flex items-center font-bold ${
              isFragmentsAllHealthy ? 'text-[#059669]' : 'text-[#dc2626]'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                isFragmentsAllHealthy ? 'bg-[#10b981]' : 'bg-[#dc2626] animate-ping'
              }`}></span>
              {isFragmentsAllHealthy ? '3/3 FRAGMENTS INTACT' : `${corruptedFragmentsCount} CORRUPTED BLOCK`}
            </span>
          </div>

          <div>
            <span className="text-[10px] font-bold text-[#6b7280] block uppercase">Zero-Trust Reassembly Viability</span>
            <span className={`inline-flex items-center font-bold font-mono ${
              canReassemble ? 'text-[#059669]' : 'text-[#92400e]'
            }`}>
              {canReassemble ? '✓ PERMITTED' : '⛔ BLOCKED BY GATES'}
            </span>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: 3-of-5 Quorum Gauge */}
        <div className="bg-white p-4 rounded-xl border border-[#e5e5ea] shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#6b7280] uppercase tracking-wider">3-of-5 Custody Quorum</span>
            <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${
              isQuorumSatisfied ? 'bg-[#ecfdf5] text-[#059669]' : 'bg-[#fef3ee] text-[#e95d2a]'
            }`}>
              <Key className="w-4 h-4" />
            </div>
          </div>
          <div className="my-2">
            <div className="text-2xl font-black text-[#222222] font-mono">
              {approvedSharesCount} <span className="text-sm font-semibold text-[#6b7280]">/ 5 Signatures</span>
            </div>
            <div className="w-full bg-[#f4f4f6] rounded-full h-2 mt-2 overflow-hidden flex">
              <div 
                className={`h-full transition-all duration-500 ${
                  isQuorumSatisfied ? 'bg-[#059669]' : 'bg-[#e95d2a]'
                }`}
                style={{ width: `${(approvedSharesCount / 5) * 100}%` }}
              ></div>
            </div>
          </div>
          <div className="text-[11px] text-[#6b7280] flex items-center justify-between">
            <span>Threshold required: ≥ 3</span>
            <span className={`font-bold ${isQuorumSatisfied ? 'text-[#059669]' : 'text-[#e95d2a]'}`}>
              {isQuorumSatisfied ? 'Quorum Met' : `Missing ${quorumDeficit}`}
            </span>
          </div>
        </div>

        {/* Card 2: Cluster Node Availability */}
        <div className="bg-white p-4 rounded-xl border border-[#e5e5ea] shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#6b7280] uppercase tracking-wider">Node Availability</span>
            <div className="w-7 h-7 rounded-lg bg-[#f4f4f6] text-[#222222] flex items-center justify-center">
              <Server className="w-4 h-4" />
            </div>
          </div>
          <div className="my-2">
            <div className="text-2xl font-black text-[#222222] font-mono">
              {onlineNodesCount === 5 ? '99.96%' : `${((onlineNodesCount / 5) * 99.96).toFixed(1)}%`}
            </div>
            <div className="text-[11px] text-[#6b7280] mt-1 flex items-center space-x-1">
              <Activity className="w-3.5 h-3.5 text-[#059669]" />
              <span>Target SLA: 99.90%</span>
            </div>
          </div>
          <div className="text-[11px] text-[#6b7280] flex items-center justify-between">
            <span>Active storage nodes:</span>
            <span className="font-bold text-[#222222]">{onlineNodesCount} of 5 Online</span>
          </div>
        </div>

        {/* Card 3: Storage Fragments Parity */}
        <div className="bg-white p-4 rounded-xl border border-[#e5e5ea] shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#6b7280] uppercase tracking-wider">Vault Fragment Parity</span>
            <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${
              isFragmentsAllHealthy ? 'bg-[#ecfdf5] text-[#059669]' : 'bg-[#fef2f2] text-[#dc2626]'
            }`}>
              <HardDrive className="w-4 h-4" />
            </div>
          </div>
          <div className="my-2">
            <div className="text-2xl font-black text-[#222222] font-mono">
              {isFragmentsAllHealthy ? '100% Valid' : 'TAMPERED'}
            </div>
            <div className="text-[11px] text-[#6b7280] mt-1">
              Store A (Head) + Store B (Body) + Store C (Tail)
            </div>
          </div>
          <div className="text-[11px] text-[#6b7280] flex items-center justify-between">
            <span>Integrity status:</span>
            <span className={`font-bold ${isFragmentsAllHealthy ? 'text-[#059669]' : 'text-[#dc2626]'}`}>
              {isFragmentsAllHealthy ? 'SHA-256 Intact' : `${corruptedFragmentsCount} Block Alert`}
            </span>
          </div>
        </div>

        {/* Card 4: Paper Reassembly Viability */}
        <div className="bg-white p-4 rounded-xl border border-[#e5e5ea] shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#6b7280] uppercase tracking-wider">Reassembly Viability</span>
            <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${
              canReassemble ? 'bg-[#ecfdf5] text-[#059669]' : 'bg-[#fffbeb] text-[#d97706]'
            }`}>
              <Cpu className="w-4 h-4" />
            </div>
          </div>
          <div className="my-2">
            <div className="text-2xl font-black text-[#222222]">
              {canReassemble ? 'DISPATCH READY' : 'BLOCKED'}
            </div>
            <div className="text-[11px] text-[#6b7280] mt-1">
              {selectedExam?.code || 'NCE-2026-CS1'} (v{selectedPaper?.version || '1.0'})
            </div>
          </div>
          <div className="text-[11px] text-[#6b7280] flex items-center justify-between">
            <span>Vault access state:</span>
            <span className={`font-bold ${canReassemble ? 'text-[#059669]' : 'text-[#d97706]'}`}>
              {canReassemble ? 'Authorized' : 'Gates Incomplete'}
            </span>
          </div>
        </div>
      </div>

      {/* SECTION 1: 3-OF-5 THRESHOLD SYNCHRONIZATION VISUALIZER */}
      <div className="bg-white rounded-xl border border-[#e5e5ea] p-6 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-[#e5e5ea]">
          <div>
            <h2 className="text-base font-extrabold text-[#222222] flex items-center space-x-2">
              <Key className="w-4 h-4 text-[#e95d2a]" />
              <span>3-of-5 Cryptographic Quorum Synchronization</span>
            </h2>
            <p className="text-xs text-[#6b7280] mt-0.5">
              Visualizing the 5 distributed key custodians. At least 3 independent cryptographic signatures are mandatory for paper sealing and controlled release.
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <span className={`px-2.5 py-1 rounded-full text-xs font-bold flex items-center space-x-1.5 ${
              isQuorumSatisfied 
                ? 'bg-[#ecfdf5] text-[#065f46] border border-[#a7f3d0]' 
                : 'bg-[#fef3ee] text-[#e95d2a] border border-[#fde2d4]'
            }`}>
              {isQuorumSatisfied ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
              <span>{isQuorumSatisfied ? 'Quorum Condition Satisfied' : 'Insufficient Custodian Signatures'}</span>
            </span>
          </div>
        </div>

        {/* Charts Row: Bar Chart with Threshold ReferenceLine & Quorum Donut */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Recharts Bar Chart with Reference Line at Threshold = 3 */}
          <div className="lg:col-span-2 bg-[#fcfcfd] rounded-xl border border-[#e5e5ea] p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-xs font-extrabold text-[#222222] uppercase tracking-wide">
                  Custodian Share Signature Status vs. Quorum Threshold (k = 3)
                </h3>
                <span className="text-[11px] text-[#6b7280]">
                  Orange reference marker denotes the minimum statutory quorum line (3 of 5)
                </span>
              </div>
              <div className="flex items-center space-x-3 text-[11px]">
                <div className="flex items-center space-x-1">
                  <span className="w-2.5 h-2.5 rounded bg-[#059669]"></span>
                  <span className="text-[#4b5563]">Approved (1.0)</span>
                </div>
                <div className="flex items-center space-x-1">
                  <span className="w-2.5 h-2.5 rounded bg-[#e5e5ea]"></span>
                  <span className="text-[#4b5563]">Pending (0.0)</span>
                </div>
              </div>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={custodianChartData} margin={{ top: 15, right: 20, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e5ea" />
                  <XAxis 
                    dataKey="name" 
                    tick={{ fontSize: 11, fill: '#6b7280' }} 
                    axisLine={{ stroke: '#e5e5ea' }} 
                    tickLine={false}
                  />
                  <YAxis 
                    domain={[0, 1.2]} 
                    ticks={[0, 0.5, 1.0]} 
                    tick={{ fontSize: 11, fill: '#6b7280' }} 
                    axisLine={{ stroke: '#e5e5ea' }}
                    tickLine={false}
                  />
                  <Tooltip 
                    formatter={(value: any, name: any, item: any) => [
                      item.payload.status,
                      item.payload.fullName
                    ]}
                    contentStyle={{ 
                      backgroundColor: '#222222', 
                      borderRadius: '8px', 
                      color: '#ffffff', 
                      fontSize: '12px',
                      border: 'none',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                    }}
                  />
                  <Bar dataKey="approvedVal" fill="#059669" radius={[4, 4, 0, 0]} name="Approved" barSize={38} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-2 text-[11px] text-[#6b7280] text-center">
              Total Approved Signatures in Active Envelope: <strong className="font-mono text-[#222222]">{approvedSharesCount} of 5</strong>
              {isQuorumSatisfied ? (
                <span className="text-[#059669] font-bold ml-1.5">✓ Meets Statutory Quorum Requirement</span>
              ) : (
                <span className="text-[#e95d2a] font-bold ml-1.5">⚠ Deficit of {quorumDeficit} signature(s)</span>
              )}
            </div>
          </div>

          {/* Recharts Donut: Quorum Fulfillment Ratio */}
          <div className="bg-[#fcfcfd] rounded-xl border border-[#e5e5ea] p-4 flex flex-col justify-between">
            <div>
              <h3 className="text-xs font-extrabold text-[#222222] uppercase tracking-wide mb-1">
                Quorum Ratio (60% Required)
              </h3>
              <p className="text-[11px] text-[#6b7280]">
                Proportion of active cryptographic shares
              </p>
            </div>

            <div className="h-44 w-full relative flex items-center justify-center my-2">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={quorumDonutData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={70}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {quorumDonutData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#222222', 
                      borderRadius: '8px', 
                      color: '#ffffff', 
                      fontSize: '12px',
                      border: 'none'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              {/* Center readout */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-2xl font-black font-mono text-[#222222]">
                  {Math.round((approvedSharesCount / 5) * 100)}%
                </span>
                <span className="text-[10px] uppercase font-bold text-[#6b7280]">
                  {approvedSharesCount}/5 Signed
                </span>
              </div>
            </div>

            <div className="pt-3 border-t border-[#e5e5ea] text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-[#6b7280]">Statutory Minimum:</span>
                <span className="font-bold text-[#222222]">3 of 5 (60.0%)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6b7280]">Current Compliance:</span>
                <span className={`font-bold ${isQuorumSatisfied ? 'text-[#059669]' : 'text-[#e95d2a]'}`}>
                  {approvedSharesCount >= 3 ? 'Quorum Satisfied' : 'Quorum Incomplete'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Interactive Custodian Shares Table & Simulator */}
        <div>
          <h3 className="text-xs font-bold text-[#222222] uppercase tracking-wider mb-2">
            Interactive Custodian Keyring Control:
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {thresholdShares.map(share => {
              return (
                <div 
                  key={share.shareIndex}
                  className={`p-3.5 rounded-xl border text-xs flex flex-col justify-between transition ${
                    share.approved 
                      ? 'bg-[#ecfdf5] border-[#a7f3d0]' 
                      : 'bg-white border-[#e5e5ea]'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-white border border-[#e5e5ea] text-[#4b5563]">
                        Share #{share.shareIndex}
                      </span>
                      {share.approved ? (
                        <span className="text-[10px] font-bold text-[#059669] flex items-center">
                          <Check className="w-3 h-3 mr-0.5" /> Approved
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-[#6b7280] flex items-center">
                          <Clock className="w-3 h-3 mr-0.5" /> Pending
                        </span>
                      )}
                    </div>
                    <div className="font-bold text-[#222222] text-xs leading-snug">
                      {share.holderTitle}
                    </div>
                    <div className="text-[10px] text-[#6b7280] mt-0.5">
                      Role: <span className="font-mono font-medium">{share.holderRole}</span>
                    </div>

                    {share.signatureToken && (
                      <div className="mt-2 text-[10px] font-mono text-[#065f46] bg-white/70 p-1.5 rounded border border-[#a7f3d0] truncate" title={share.signatureToken}>
                        {share.signatureToken}
                      </div>
                    )}
                  </div>

                  {(() => {
                    const isCustodian = currentUser.role === share.holderRole;

                    if (isCustodian) {
                      return (
                        <button
                          type="button"
                          onClick={() => selectedPaper && toggleThresholdShare(selectedPaper.id, share.shareIndex)}
                          className={`mt-3 w-full py-1.5 rounded-lg text-xs font-bold transition flex items-center justify-center space-x-1 ${
                            share.approved
                              ? 'bg-white hover:bg-[#fef2f2] text-[#dc2626] border border-[#fecaca]'
                              : 'bg-[#e95d2a] hover:bg-[#d44c1b] text-white'
                          }`}
                        >
                          {share.approved ? (
                            <>
                              <X className="w-3.5 h-3.5" />
                              <span>Revoke Signature</span>
                            </>
                          ) : (
                            <>
                              <Check className="w-3.5 h-3.5" />
                              <span>Sign Share as {share.holderRole}</span>
                            </>
                          )}
                        </button>
                      );
                    }

                    return (
                      <div className="mt-3 flex items-center justify-between gap-1.5 pt-2 border-t border-[#e5e5ea]">
                        <span className="text-[10px] text-[#6b7280] font-mono truncate">
                          {share.approved ? 'Signed' : `Req: ${share.holderRole}`}
                        </span>
                        <button
                          type="button"
                          onClick={() => switchRole(share.holderRole)}
                          className="px-2 py-1 rounded text-[10px] font-semibold bg-white hover:bg-[#f4f4f6] text-[#222222] border border-[#d1d1d6] transition whitespace-nowrap"
                          title={`Switch persona to ${share.holderRole}`}
                        >
                          Switch Persona
                        </button>
                      </div>
                    );
                  })()}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* SECTION 2: INDIVIDUAL STORAGE NODE AVAILABILITY & TELEMETRY */}
      <div className="bg-white rounded-xl border border-[#e5e5ea] p-6 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-[#e5e5ea]">
          <div>
            <h2 className="text-base font-extrabold text-[#222222] flex items-center space-x-2">
              <Server className="w-4 h-4 text-[#e95d2a]" />
              <span>Multi-Vault Storage Node Availability & SLA Telemetry</span>
            </h2>
            <p className="text-xs text-[#6b7280] mt-0.5">
              Monitoring the 5 distributed storage nodes. AES-256-GCM fragments are partitioned across physically isolated vaults to enforce Zero-Knowledge custody.
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-xs text-[#6b7280]">
              Active Cluster Availability: <strong className="font-mono text-[#222222]">
                {(nodesState.filter(n => !n.isOffline).length / 5 * 99.96).toFixed(2)}%
              </strong>
            </span>
          </div>
        </div>

        {/* Charts Row: Storage Node SLA Bar Chart & Radar Resilience */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Recharts Bar Chart: Node Availability vs SLA Line */}
          <div className="lg:col-span-2 bg-[#fcfcfd] rounded-xl border border-[#e5e5ea] p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-xs font-extrabold text-[#222222] uppercase tracking-wide">
                  Storage Node Uptime Availability vs. SLA Target (99.90%)
                </h3>
                <span className="text-[11px] text-[#6b7280]">
                  Visualized with Recharts. Red reference line denotes the strict 99.90% SLA threshold
                </span>
              </div>
              <div className="flex items-center space-x-2 text-[11px]">
                <span className="w-2 h-2 rounded-full bg-[#e95d2a]"></span>
                <span className="text-[#6b7280] font-mono">SLA 99.90%</span>
              </div>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={nodeAvailabilityData} margin={{ top: 15, right: 20, left: -10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e5ea" />
                  <XAxis 
                    dataKey="name" 
                    tick={{ fontSize: 11, fill: '#6b7280' }} 
                    axisLine={{ stroke: '#e5e5ea' }} 
                    tickLine={false}
                  />
                  <YAxis 
                    domain={[0, 105]} 
                    ticks={[0, 25, 50, 75, 99.9, 100]} 
                    tick={{ fontSize: 11, fill: '#6b7280' }} 
                    axisLine={{ stroke: '#e5e5ea' }}
                    tickLine={false}
                  />
                  <Tooltip 
                    formatter={(value: any, name: any, item: any) => [
                      `${value}% Uptime (${item.payload.status})`,
                      item.payload.name
                    ]}
                    contentStyle={{ 
                      backgroundColor: '#222222', 
                      borderRadius: '8px', 
                      color: '#ffffff', 
                      fontSize: '12px',
                      border: 'none',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                    }}
                  />
                  <ReferenceLine y={99.90} stroke="#e95d2a" strokeDasharray="3 3" strokeWidth={1.5} label={{ value: 'SLA: 99.9%', fill: '#e95d2a', fontSize: 10, position: 'right' }} />
                  <Bar dataKey="availability" radius={[4, 4, 0, 0]} barSize={38}>
                    {nodeAvailabilityData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry.status === 'HEALTHY' ? '#059669' : entry.status === 'CORRUPTED' ? '#d97706' : '#dc2626'} 
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-2 text-[11px] text-[#6b7280] flex items-center justify-between px-2">
              <span className="flex items-center space-x-1">
                <span className="w-2 h-2 rounded bg-[#059669]"></span>
                <span>Normal (&gt; 99.9% SLA)</span>
              </span>
              <span className="flex items-center space-x-1">
                <span className="w-2 h-2 rounded bg-[#d97706]"></span>
                <span>Integrity Warning / Parity Check</span>
              </span>
              <span className="flex items-center space-x-1">
                <span className="w-2 h-2 rounded bg-[#dc2626]"></span>
                <span>Node Simulated Offline / Maintenance</span>
              </span>
            </div>
          </div>

          {/* Recharts Radar: Multi-Vector Node Resilience */}
          <div className="bg-[#fcfcfd] rounded-xl border border-[#e5e5ea] p-4 flex flex-col justify-between">
            <div>
              <h3 className="text-xs font-extrabold text-[#222222] uppercase tracking-wide mb-1">
                Zero-Trust Resilience Radar
              </h3>
              <p className="text-[11px] text-[#6b7280]">
                Multi-dimensional cluster health assessment
              </p>
            </div>

            <div className="h-56 w-full relative my-1">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarMetricsData} outerRadius="70%">
                  <PolarGrid stroke="#e5e5ea" />
                  <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fill: '#6b7280' }} />
                  <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
                  <Radar name="Cluster Score" dataKey="score" stroke="#059669" fill="#059669" fillOpacity={0.25} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#222222', 
                      borderRadius: '8px', 
                      color: '#ffffff', 
                      fontSize: '12px',
                      border: 'none'
                    }}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            <div className="pt-2 border-t border-[#e5e5ea] text-[11px] text-[#6b7280] flex justify-between">
              <span>Overall Resilience Index:</span>
              <strong className="font-mono text-[#059669]">
                {Math.round(radarMetricsData.reduce((acc, curr) => acc + curr.score, 0) / radarMetricsData.length)} / 100
              </strong>
            </div>
          </div>
        </div>

        {/* Recharts Area Chart: Real-Time Heartbeat Ping Latency */}
        <div className="bg-[#fcfcfd] rounded-xl border border-[#e5e5ea] p-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-xs font-extrabold text-[#222222] uppercase tracking-wide">
                Storage Vault Network Latency Streams (ms Ping Response)
              </h3>
              <span className="text-[11px] text-[#6b7280]">
                Heartbeat response times over recent synchronization epochs across all 5 vaults
              </span>
            </div>
            <div className="flex items-center space-x-3 text-[11px] font-mono">
              <span className="text-[#059669]">● Vault Alpha</span>
              <span className="text-[#2563eb]">● Vault Beta</span>
              <span className="text-[#d97706]">● Vault Gamma</span>
              <span className="text-[#7c3aed]">● Vault Delta</span>
              <span className="text-[#64748b]">● Vault Epsilon</span>
            </div>
          </div>

          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={LATENCY_SERIES} margin={{ top: 10, right: 15, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorAlpha" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#059669" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#059669" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorBeta" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e5ea" />
                <XAxis dataKey="epoch" tick={{ fontSize: 11, fill: '#6b7280' }} axisLine={{ stroke: '#e5e5ea' }} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#6b7280' }} axisLine={{ stroke: '#e5e5ea' }} tickLine={false} unit="ms" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#222222', 
                    borderRadius: '8px', 
                    color: '#ffffff', 
                    fontSize: '12px',
                    border: 'none'
                  }}
                />
                <Area type="monotone" dataKey="alpha" stroke="#059669" fillOpacity={1} fill="url(#colorAlpha)" name="Vault Alpha" />
                <Area type="monotone" dataKey="beta" stroke="#2563eb" fillOpacity={1} fill="url(#colorBeta)" name="Vault Beta" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Individual Node Management Cards */}
        <div>
          <h3 className="text-xs font-bold text-[#222222] uppercase tracking-wider mb-2">
            Storage Nodes Operational Controls:
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {nodesState.map((node, idx) => {
              // Fragment for this node if applicable
              const fragNumber = idx + 1;
              const frag = fragments.find(f => f.fragmentNumber === fragNumber);
              const isCorrupted = frag?.isCorrupted || false;

              return (
                <div 
                  key={node.id}
                  className={`bg-white rounded-xl border p-4 shadow-xs flex flex-col justify-between transition ${
                    node.isOffline 
                      ? 'border-[#fecaca] bg-[#fffafb]' 
                      : isCorrupted 
                        ? 'border-[#fed7aa] bg-[#fffbf7]' 
                        : 'border-[#e5e5ea]'
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-extrabold text-sm text-[#222222]">{node.name}</span>
                        </div>
                        <span className="text-[10px] text-[#6b7280] font-mono block mt-0.5">{node.zone}</span>
                      </div>

                      {node.isOffline ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#fef2f2] text-[#dc2626] border border-[#fecaca] flex items-center space-x-1">
                          <WifiOff className="w-3 h-3" />
                          <span>OFFLINE</span>
                        </span>
                      ) : isCorrupted ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#fff7ed] text-[#c2410c] border border-[#ffedd5] flex items-center space-x-1">
                          <AlertTriangle className="w-3 h-3" />
                          <span>TAMPERED</span>
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#ecfdf5] text-[#059669] border border-[#a7f3d0] flex items-center space-x-1">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>HEALTHY</span>
                        </span>
                      )}
                    </div>

                    <div className="bg-[#f4f4f6] p-2.5 rounded-lg border border-[#e5e5ea] text-xs space-y-1 my-3">
                      <div className="flex justify-between">
                        <span className="text-[#6b7280]">Role:</span>
                        <span className="font-semibold text-[#222222] text-right truncate max-w-[180px]">{node.role}</span>
                      </div>
                      <div className="flex justify-between font-mono">
                        <span className="text-[#6b7280]">Path:</span>
                        <span className="text-[#4b5563] text-[11px] truncate max-w-[180px]">{node.vaultPath}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#6b7280]">Response Latency:</span>
                        <span className="font-mono font-bold text-[#222222]">
                          {node.isOffline ? 'TIMEOUT' : `${node.baseLatencyMs} ms`}
                        </span>
                      </div>
                    </div>

                    {frag && (
                      <div className="text-[11px] text-[#6b7280] mb-3 space-y-1">
                        <div className="flex justify-between">
                          <span>Fragment Storage Hash:</span>
                          <span className="font-mono font-bold text-[#222222] truncate max-w-[160px]" title={frag.checksum}>
                            {frag.checksum.slice(0, 16)}...
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Physical Bit Integrity:</span>
                          <span className={`font-bold ${isCorrupted ? 'text-[#dc2626]' : 'text-[#059669]'}`}>
                            {isCorrupted ? '⚠ Corrupted Bits Injected' : '✓ Byte-Level Intact'}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="pt-2 border-t border-[#f0f0f2] space-y-2">
                    {/* Node Offline simulation */}
                    <div className="flex items-center space-x-2">
                      <button
                        type="button"
                        onClick={() => handleToggleNodeOffline(node.id)}
                        className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition flex items-center justify-center space-x-1 border ${
                          node.isOffline 
                            ? 'bg-[#ecfdf5] hover:bg-[#d1fae5] text-[#065f46] border-[#a7f3d0]' 
                            : 'bg-[#f4f4f6] hover:bg-[#e5e5ea] text-[#4b5563] border-[#e5e5ea]'
                        }`}
                      >
                        {node.isOffline ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
                        <span>{node.isOffline ? 'Re-enable Node' : 'Simulate Offline'}</span>
                      </button>

                      {/* Fragment Tamper Toggle for Stores 1, 2, 3 */}
                      {frag && (
                        <button
                          type="button"
                          onClick={() => handleToggleFragmentTamper(frag.fragmentNumber, isCorrupted)}
                          className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition flex items-center justify-center space-x-1 ${
                            isCorrupted 
                              ? 'bg-[#059669] hover:bg-[#047857] text-white' 
                              : 'bg-[#fef2f2] hover:bg-[#fee2e2] text-[#dc2626] border border-[#fecaca]'
                          }`}
                        >
                          {isCorrupted ? (
                            <>
                              <RefreshCw className="w-3.5 h-3.5" />
                              <span>Self-Heal</span>
                            </>
                          ) : (
                            <>
                              <AlertTriangle className="w-3.5 h-3.5" />
                              <span>Test Tamper</span>
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

    </div>
  );
};
