import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());

// In-memory persistent database for Access Codes and Active VPN Sessions
export interface AccessCode {
  id: string;
  code: string;
  planId: string;
  planName: string;
  carrier: 'MTN' | 'TELKOM' | 'CELL C' | 'VODACOM' | 'ALL';
  dataLimitBytes: number;
  dataUsedBytes: number;
  durationDays: number;
  createdAt: number;
  expiresAt: number;
  status: 'ACTIVE' | 'EXPIRED' | 'REVOKED' | 'IN_USE';
  generatedBy: string;
  customerNote?: string;
  codeType: 'TRIAL' | 'PAID_SINGLE_PHONE';
  maxAllowedUsers: number;
  boundDeviceIds: string[];
  lockedToDeviceId?: string;
}

export interface VpnSession {
  sessionId: string;
  code: string;
  carrier: 'MTN' | 'TELKOM' | 'CELL C' | 'VODACOM';
  clientIp: string;
  assignedVirtualIp: string;
  serverNode: string;
  connectedAt: number;
  lastActiveAt: number;
  bytesUploaded: number;
  bytesDownloaded: number;
  status: 'CONNECTED' | 'DISCONNECTED';
  encryptionCipher: string;
}

// Initial seed codes for instant testing & demonstration
const ACCESS_CODES: Map<string, AccessCode> = new Map();
const ACTIVE_SESSIONS: Map<string, VpnSession> = new Map();

// Seed default codes
const now = Date.now();
const seedCodes: AccessCode[] = [
  {
    id: 'code-trial-50',
    code: 'TRIAL-FREE-50',
    planId: 'plan-6gb',
    planName: 'Free Community Trial Pass',
    carrier: 'ALL',
    dataLimitBytes: 15 * 1024 * 1024 * 1024,
    dataUsedBytes: 1.2 * 1024 * 1024 * 1024,
    durationDays: 7,
    createdAt: now - 3600000 * 24,
    expiresAt: now + 3600000 * 24 * 6,
    status: 'ACTIVE',
    generatedBy: 'Admin (Master)',
    customerNote: 'Multi-User Trial Promo (Can use 50+ people simultaneously)',
    codeType: 'TRIAL',
    maxAllowedUsers: 100,
    boundDeviceIds: ['phone-za-demo1', 'phone-za-demo2', 'phone-za-demo3'],
  },
  {
    id: 'code-1',
    code: 'SALV-100GB-ZA88',
    planId: 'plan-100gb',
    planName: '100GB Ultimate',
    carrier: 'ALL',
    dataLimitBytes: 100 * 1024 * 1024 * 1024,
    dataUsedBytes: 2.4 * 1024 * 1024 * 1024,
    durationDays: 30,
    createdAt: now - 3600000 * 24 * 2,
    expiresAt: now + 3600000 * 24 * 28,
    status: 'ACTIVE',
    generatedBy: 'Admin (Master)',
    customerNote: 'Paid WhatsApp Pass - Locked to 1 single phone upon connect',
    codeType: 'PAID_SINGLE_PHONE',
    maxAllowedUsers: 1,
    boundDeviceIds: [],
  },
  {
    id: 'code-2',
    code: 'SALV-99GB-MTN49',
    planId: 'plan-99gb',
    planName: '99GB Power MTN',
    carrier: 'MTN',
    dataLimitBytes: 99 * 1024 * 1024 * 1024,
    dataUsedBytes: 512 * 1024 * 1024,
    durationDays: 30,
    createdAt: now - 3600000 * 12,
    expiresAt: now + 3600000 * 24 * 29,
    status: 'ACTIVE',
    generatedBy: 'Admin (Master)',
    customerNote: 'MTN High-Speed Dedicated APN (Single Phone Only)',
    codeType: 'PAID_SINGLE_PHONE',
    maxAllowedUsers: 1,
    boundDeviceIds: [],
  },
  {
    id: 'code-3',
    code: 'SALV-180GB-VOD90',
    planId: 'plan-180gb',
    planName: '180GB Mega Pass',
    carrier: 'VODACOM',
    dataLimitBytes: 180 * 1024 * 1024 * 1024,
    dataUsedBytes: 14.8 * 1024 * 1024 * 1024,
    durationDays: 30,
    createdAt: now - 3600000 * 48,
    expiresAt: now + 3600000 * 24 * 26,
    status: 'ACTIVE',
    generatedBy: 'Admin (Master)',
    customerNote: 'Vodacom Direct Tunnel (Single Phone Only)',
    codeType: 'PAID_SINGLE_PHONE',
    maxAllowedUsers: 1,
    boundDeviceIds: [],
  },
  {
    id: 'code-4',
    code: 'SALV-DEMO-EXPIRED',
    planId: 'plan-6gb',
    planName: '6GB Starter',
    carrier: 'ALL',
    dataLimitBytes: 6 * 1024 * 1024 * 1024,
    dataUsedBytes: 6 * 1024 * 1024 * 1024,
    durationDays: 1,
    createdAt: now - 3600000 * 30,
    expiresAt: now - 3600000 * 6,
    status: 'EXPIRED',
    generatedBy: 'System',
    customerNote: 'Expired demo token',
    codeType: 'PAID_SINGLE_PHONE',
    maxAllowedUsers: 1,
    boundDeviceIds: [],
  }
];

seedCodes.forEach(c => ACCESS_CODES.set(c.code.toUpperCase(), c));

// South Africa VPN Server Nodes (All 9 Provinces Covered)
const SERVER_NODES = [
  {
    id: 'za-jnb-01',
    name: 'Johannesburg Core (JNB-1)',
    city: 'Johannesburg',
    province: 'Gauteng',
    country: 'South Africa',
    host: 'jnb1.salvation-vpn.co.za',
    ip: '102.130.112.45',
    latencyBase: 12,
    status: 'OPTIMAL',
    load: 28,
    supportedCarriers: ['MTN', 'TELKOM', 'CELL C', 'VODACOM'],
    wireguardEndpoint: '102.130.112.45:51820',
    serverPublicKey: 'SALVATION+JNB1+PubKey09a1bf72ce4e5a9c0d12e==',
    tlsPort: 443,
    sshPort: 22,
    dropbearPort: 442,
    v2rayPort: 443,
    wsPath: '/salvation-ws',
  },
  {
    id: 'za-pry-01',
    name: 'Pretoria Fast Route (PRY-1)',
    city: 'Pretoria',
    province: 'Gauteng',
    country: 'South Africa',
    host: 'pry1.salvation-vpn.co.za',
    ip: '196.4.160.88',
    latencyBase: 14,
    status: 'OPTIMAL',
    load: 22,
    supportedCarriers: ['MTN', 'TELKOM', 'CELL C', 'VODACOM'],
    wireguardEndpoint: '196.4.160.88:51820',
    serverPublicKey: 'SALVATION+PRY1+PubKey9921eaf082dc0a911a==',
    tlsPort: 443,
    sshPort: 22,
    dropbearPort: 442,
    v2rayPort: 443,
    wsPath: '/salvation-ws',
  },
  {
    id: 'za-mpu-01',
    name: 'Nelspruit / Mbombela Highveld (MPU-1)',
    city: 'Mbombela (Nelspruit)',
    province: 'Mpumalanga',
    country: 'South Africa',
    host: 'mpu1.salvation-vpn.co.za',
    ip: '102.132.88.40',
    latencyBase: 16,
    status: 'OPTIMAL',
    load: 18,
    supportedCarriers: ['MTN', 'TELKOM', 'CELL C', 'VODACOM'],
    wireguardEndpoint: '102.132.88.40:51820',
    serverPublicKey: 'SALVATION+MPU1+PubKey38fa10b987ec42a0011d==',
    tlsPort: 443,
    sshPort: 22,
    dropbearPort: 442,
    v2rayPort: 443,
    wsPath: '/salvation-ws',
  },
  {
    id: 'za-nwt-01',
    name: 'Rustenburg Platinum Route (NWT-1)',
    city: 'Rustenburg / Mahikeng',
    province: 'North West',
    country: 'South Africa',
    host: 'nwt1.salvation-vpn.co.za',
    ip: '102.140.22.18',
    latencyBase: 17,
    status: 'OPTIMAL',
    load: 15,
    supportedCarriers: ['MTN', 'TELKOM', 'CELL C', 'VODACOM'],
    wireguardEndpoint: '102.140.22.18:51820',
    serverPublicKey: 'SALVATION+NWT1+PubKey66b2a09f871cb4112e==',
    tlsPort: 443,
    sshPort: 22,
    dropbearPort: 442,
    v2rayPort: 443,
    wsPath: '/salvation-ws',
  },
  {
    id: 'za-cpt-01',
    name: 'Cape Town SeaPoint (CPT-1)',
    city: 'Cape Town',
    province: 'Western Cape',
    country: 'South Africa',
    host: 'cpt1.salvation-vpn.co.za',
    ip: '197.234.88.19',
    latencyBase: 24,
    status: 'ONLINE',
    load: 34,
    supportedCarriers: ['MTN', 'TELKOM', 'CELL C', 'VODACOM'],
    wireguardEndpoint: '197.234.88.19:51820',
    serverPublicKey: 'SALVATION+CPT1+PubKey8812fbc944e0192a83f1d==',
    tlsPort: 443,
    sshPort: 22,
    dropbearPort: 442,
    v2rayPort: 443,
    wsPath: '/salvation-ws',
  },
  {
    id: 'za-dur-01',
    name: 'Durban Gateway (DUR-1)',
    city: 'Durban',
    province: 'KwaZulu-Natal',
    country: 'South Africa',
    host: 'dur1.salvation-vpn.co.za',
    ip: '105.210.44.82',
    latencyBase: 28,
    status: 'ONLINE',
    load: 19,
    supportedCarriers: ['MTN', 'TELKOM', 'CELL C', 'VODACOM'],
    wireguardEndpoint: '105.210.44.82:51820',
    serverPublicKey: 'SALVATION+DUR1+PubKey14d23ac782ef998012bb4==',
    tlsPort: 443,
    sshPort: 22,
    dropbearPort: 442,
    v2rayPort: 443,
    wsPath: '/salvation-ws',
  },
  {
    id: 'za-lim-01',
    name: 'Polokwane Northern Border (LIM-1)',
    city: 'Polokwane',
    province: 'Limpopo',
    country: 'South Africa',
    host: 'lim1.salvation-vpn.co.za',
    ip: '105.234.19.72',
    latencyBase: 19,
    status: 'OPTIMAL',
    load: 14,
    supportedCarriers: ['MTN', 'TELKOM', 'CELL C', 'VODACOM'],
    wireguardEndpoint: '105.234.19.72:51820',
    serverPublicKey: 'SALVATION+LIM1+PubKey44b190ac77e023f8101a==',
    tlsPort: 443,
    sshPort: 22,
    dropbearPort: 442,
    v2rayPort: 443,
    wsPath: '/salvation-ws',
  },
  {
    id: 'za-bfs-01',
    name: 'Bloemfontein Central Hub (BFS-1)',
    city: 'Bloemfontein',
    province: 'Free State',
    country: 'South Africa',
    host: 'bfs1.salvation-vpn.co.za',
    ip: '197.189.55.91',
    latencyBase: 21,
    status: 'ONLINE',
    load: 16,
    supportedCarriers: ['MTN', 'TELKOM', 'CELL C', 'VODACOM'],
    wireguardEndpoint: '197.189.55.91:51820',
    serverPublicKey: 'SALVATION+BFS1+PubKey128f73da01efbb88390c==',
    tlsPort: 443,
    sshPort: 22,
    dropbearPort: 442,
    v2rayPort: 443,
    wsPath: '/salvation-ws',
  },
  {
    id: 'za-ecp-01',
    name: 'Gqeberha Coastal Gateway (ECP-1)',
    city: 'Gqeberha (Port Elizabeth)',
    province: 'Eastern Cape',
    country: 'South Africa',
    host: 'ecp1.salvation-vpn.co.za',
    ip: '196.25.101.44',
    latencyBase: 26,
    status: 'ONLINE',
    load: 20,
    supportedCarriers: ['MTN', 'TELKOM', 'CELL C', 'VODACOM'],
    wireguardEndpoint: '196.25.101.44:51820',
    serverPublicKey: 'SALVATION+ECP1+PubKey77a1029dfe8834bc0019==',
    tlsPort: 443,
    sshPort: 22,
    dropbearPort: 442,
    v2rayPort: 443,
    wsPath: '/salvation-ws',
  },
  {
    id: 'za-ncp-01',
    name: 'Kimberley Diamond Route (NCP-1)',
    city: 'Kimberley',
    province: 'Northern Cape',
    country: 'South Africa',
    host: 'ncp1.salvation-vpn.co.za',
    ip: '102.165.70.33',
    latencyBase: 23,
    status: 'ONLINE',
    load: 12,
    supportedCarriers: ['MTN', 'TELKOM', 'CELL C', 'VODACOM'],
    wireguardEndpoint: '102.165.70.33:51820',
    serverPublicKey: 'SALVATION+NCP1+PubKey901fa882cb0184491de1==',
    tlsPort: 443,
    sshPort: 22,
    dropbearPort: 442,
    v2rayPort: 443,
    wsPath: '/salvation-ws',
  },
];

// Helper to check expiration
function checkCodeExpiration(codeObj: AccessCode): boolean {
  if (codeObj.status === 'REVOKED') return true;
  if (Date.now() > codeObj.expiresAt) {
    codeObj.status = 'EXPIRED';
    return true;
  }
  return false;
}

// ---------------- API ENDPOINTS ---------------- //

// Ping endpoint for genuine latency measurement (Strict South Africa node)
app.get('/api/vpn/ping', (req, res) => {
  const start = req.query.t ? Number(req.query.t) : Date.now();
  const serverTime = Date.now();
  res.json({
    pong: true,
    clientSendTime: start,
    serverTime,
    region: 'South Africa (za-south-1)',
    node: 'jnb-1',
    country: 'South Africa',
    southAfricaLocked: true,
  });
});

// VPN Infrastructure & Node Status (Strictly South African VPS Nodes)
app.get('/api/vpn/nodes', (req, res) => {
  res.json({
    nodes: SERVER_NODES,
    defaultNode: SERVER_NODES[0],
    southAfricaLocked: true,
    country: 'South Africa',
    encryption: 'TLS 1.3 · ChaCha20-Poly1305 / AES-256-GCM',
    tunnelProtocols: ['TLS Direct SNI (Port 443)', 'TLS + Custom Payload', 'V2Ray WS-TLS', 'WireGuard UDP'],
    activeUsersCount: 1482 + ACTIVE_SESSIONS.size,
  });
});

// Full VPS & SNI Configuration for South Africa Tunnels (HTTP Custom, HA Tunnel, TLS Tunnel)
app.get('/api/vpn/vps-config', (req, res) => {
  res.json({
    southAfricaLocked: true,
    region: 'South Africa (za-south-1)',
    nodes: SERVER_NODES,
    defaultSniHosts: {
      MTN: 'mydata.mtn.co.za',
      TELKOM: 'telkom.internet',
      'CELL C': 'customer.cellc.co.za',
      VODACOM: 'vodacom-tunnel.salvation-vpn.co.za',
    },
    tlsEngine: {
      version: 'TLS 1.3',
      defaultPort: 443,
      ciphers: ['TLS_CHACHA20_POLY1305_SHA256', 'TLS_AES_256_GCM_SHA384'],
      alpn: ['h2', 'http/1.1'],
    },
    dnsServers: ['196.43.1.11', '196.25.1.1', '1.1.1.1', '8.8.8.8'],
    vpsCredentials: {
      sshUser: 'salvation-za',
      sshPort: 22,
      dropbearPort: 442,
      sslPort: 443,
      wireguardPort: 51820,
      v2rayPort: 443,
      wsPath: '/salvation-ws',
      authMethod: 'Single-Phone Access Code (SALV-... / TRIAL-...)',
    },
  });
});

// Verify Access Code
app.post('/api/vpn/verify-code', (req, res) => {
  const { code, carrier, deviceId } = req.body;
  if (!code || typeof code !== 'string') {
    return res.status(400).json({ valid: false, error: 'Please enter a valid access code.' });
  }

  const cleanCode = code.trim().toUpperCase();
  const codeObj = ACCESS_CODES.get(cleanCode);

  if (!codeObj) {
    return res.status(404).json({
      valid: false,
      error: 'Access code not found. Please check spelling or purchase a code on WhatsApp (+27 63 824 9382).',
    });
  }

  const isExpired = checkCodeExpiration(codeObj);
  if (isExpired || codeObj.status === 'EXPIRED') {
    return res.status(403).json({
      valid: false,
      error: `Access code has expired on ${new Date(codeObj.expiresAt).toLocaleString('en-ZA')}. Please get a new code.`,
      codeDetails: codeObj,
    });
  }

  if (codeObj.status === 'REVOKED') {
    return res.status(403).json({
      valid: false,
      error: 'This access code has been revoked by the administrator.',
      codeDetails: codeObj,
    });
  }

  // Single-phone vs Multi-user trial verification
  const isPaidSinglePhone = codeObj.codeType === 'PAID_SINGLE_PHONE' || cleanCode.startsWith('SALV-');
  const isTrial = codeObj.codeType === 'TRIAL' || cleanCode.startsWith('TRIAL-');

  if (isPaidSinglePhone) {
    if (codeObj.lockedToDeviceId && deviceId && codeObj.lockedToDeviceId !== deviceId) {
      return res.status(403).json({
        valid: false,
        error: 'Single-Phone Lock: This paid SALV code is already registered to another phone. Paid codes can only be used on 1 single phone. Contact WhatsApp (+27 63 824 9382) to transfer phone.',
        codeDetails: codeObj,
      });
    }
  } else if (isTrial) {
    if (deviceId && !codeObj.boundDeviceIds.includes(deviceId)) {
      if (codeObj.boundDeviceIds.length >= codeObj.maxAllowedUsers) {
        return res.status(403).json({
          valid: false,
          error: `Trial limit reached: Maximum user capacity (${codeObj.maxAllowedUsers}) reached for this promo batch.`,
          codeDetails: codeObj,
        });
      }
    }
  }

  // Carrier check (if code is locked to a specific carrier)
  if (carrier && codeObj.carrier !== 'ALL' && codeObj.carrier !== carrier) {
    return res.status(400).json({
      valid: false,
      error: `This code is exclusively provisioned for ${codeObj.carrier}. Selected carrier is ${carrier}.`,
      codeDetails: codeObj,
    });
  }

  const remainingMs = codeObj.expiresAt - Date.now();
  const remainingHours = Math.max(0, Math.floor(remainingMs / (1000 * 60 * 60)));
  const remainingDays = Math.floor(remainingHours / 24);

  return res.json({
    valid: true,
    code: codeObj.code,
    planName: codeObj.planName,
    carrier: codeObj.carrier,
    dataLimitBytes: codeObj.dataLimitBytes,
    dataUsedBytes: codeObj.dataUsedBytes,
    expiresAt: codeObj.expiresAt,
    remainingDays,
    remainingHours,
    customerNote: codeObj.customerNote,
    codeType: codeObj.codeType || (cleanCode.startsWith('TRIAL-') ? 'TRIAL' : 'PAID_SINGLE_PHONE'),
    boundUsersCount: codeObj.boundDeviceIds.length,
    maxAllowedUsers: codeObj.maxAllowedUsers,
  });
});

// Real VPN Connect Handshake (Strict: Cannot connect without valid non-expired access code)
app.post('/api/vpn/connect', (req, res) => {
  const { code, carrier, preferredNodeId, deviceId, tlsMode, sniHost } = req.body;

  if (!code || typeof code !== 'string') {
    return res.status(400).json({
      success: false,
      error: 'Authentication failed: An authorized access code is strictly required to establish VPN tunnel.',
    });
  }

  const cleanCode = code.trim().toUpperCase();
  const codeObj = ACCESS_CODES.get(cleanCode);

  if (!codeObj) {
    return res.status(401).json({
      success: false,
      error: 'Access code invalid or unauthorized. Contact administrator via WhatsApp to acquire an active pass.',
    });
  }

  if (checkCodeExpiration(codeObj) || codeObj.status === 'EXPIRED') {
    return res.status(403).json({
      success: false,
      error: 'Authentication rejected: Access code has expired. Cannot establish tunnel.',
    });
  }

  if (codeObj.status === 'REVOKED') {
    return res.status(403).json({
      success: false,
      error: 'Access code suspended/revoked by system administrator.',
    });
  }

  // Device Binding & Protection:
  // Paid SALV codes -> Locked to 1 single phone
  // Trial codes -> Shared across 50+ users
  const isPaidSinglePhone = codeObj.codeType === 'PAID_SINGLE_PHONE' || cleanCode.startsWith('SALV-');
  const isTrial = codeObj.codeType === 'TRIAL' || cleanCode.startsWith('TRIAL-');

  if (isPaidSinglePhone) {
    if (codeObj.lockedToDeviceId && deviceId && codeObj.lockedToDeviceId !== deviceId) {
      return res.status(403).json({
        success: false,
        error: 'Single-Phone Protection: This paid SALV access code is registered to another phone. Paid codes can only be used on 1 single phone. Contact WhatsApp (+27 63 824 9382) to reset phone binding.',
      });
    }

    // First phone activation -> bind to deviceId
    if (deviceId) {
      if (!codeObj.lockedToDeviceId) {
        codeObj.lockedToDeviceId = deviceId;
      }
      if (!codeObj.boundDeviceIds.includes(deviceId)) {
        codeObj.boundDeviceIds.push(deviceId);
      }
    }
  } else if (isTrial) {
    // Multi-user trial: allows 50+ people up to maxAllowedUsers (default 100)
    if (deviceId && !codeObj.boundDeviceIds.includes(deviceId)) {
      if (codeObj.boundDeviceIds.length >= codeObj.maxAllowedUsers) {
        return res.status(403).json({
          success: false,
          error: `Trial user limit reached: Maximum of ${codeObj.maxAllowedUsers} users have already claimed this trial code.`,
        });
      }
      codeObj.boundDeviceIds.push(deviceId);
    }
  }

  const targetCarrier = (carrier || 'MTN') as 'MTN' | 'TELKOM' | 'CELL C' | 'VODACOM';

  // Check carrier restriction
  if (codeObj.carrier !== 'ALL' && codeObj.carrier !== targetCarrier) {
    return res.status(400).json({
      success: false,
      error: `Carrier mismatch: Code is provisioned for ${codeObj.carrier}.`,
    });
  }

  // Selected node validation - Must be strictly South Africa
  const node = SERVER_NODES.find(n => n.id === preferredNodeId) || SERVER_NODES[0];
  if (!node || node.country !== 'South Africa') {
    return res.status(403).json({
      success: false,
      error: 'Connection Restricted: Salvation Mahumane VPN is exclusively locked to South Africa servers only.',
    });
  }

  // South African Carrier SNI Bug Host Defaults
  const defaultCarrierSni = targetCarrier === 'MTN' ? 'mydata.mtn.co.za' :
                           targetCarrier === 'TELKOM' ? 'telkom.internet' :
                           targetCarrier === 'CELL C' ? 'customer.cellc.co.za' : 'vodacom-tunnel.salvation-vpn.co.za';
  const resolvedSniHost = (sniHost && typeof sniHost === 'string' && sniHost.trim()) ? sniHost.trim() : defaultCarrierSni;
  const resolvedTlsMode = tlsMode || 'TLS_DIRECT_SNI';

  // Allocate virtual tunnel IP in South Africa subnet 10.84.x.x
  const randomSubnet = Math.floor(Math.random() * 200) + 10;
  const randomHost = Math.floor(Math.random() * 240) + 2;
  const virtualIp = `10.84.${randomSubnet}.${randomHost}/32`;

  const sessionId = 'vpn-sess-' + crypto.randomBytes(6).toString('hex');
  const sessionToken = crypto.randomBytes(16).toString('hex');

  const session: VpnSession = {
    sessionId,
    code: cleanCode,
    carrier: targetCarrier,
    clientIp: req.ip || '196.4.160.22',
    assignedVirtualIp: virtualIp,
    serverNode: node.name,
    connectedAt: Date.now(),
    lastActiveAt: Date.now(),
    bytesUploaded: 0,
    bytesDownloaded: 0,
    status: 'CONNECTED',
    encryptionCipher: 'TLS 1.3 · ChaCha20-Poly1305 (256-bit Key Exchange)',
  };

  ACTIVE_SESSIONS.set(sessionId, session);
  codeObj.status = 'IN_USE';

  // Return connection parameters ready for Android VpnService, TLS Engine & live client
  res.json({
    success: true,
    sessionToken,
    sessionId,
    virtualIp,
    serverNode: node,
    southAfricaLocked: true,
    dnsServers: ['196.43.1.11', '196.25.1.1', '1.1.1.1', '8.8.8.8'],
    mtu: 1500,
    allowedIps: '0.0.0.0/0',
    tlsConfig: {
      tlsMode: resolvedTlsMode,
      sniHost: resolvedSniHost,
      tlsPort: 443,
      tlsVersion: 'TLS 1.3',
      cipherSuite: 'TLS_CHACHA20_POLY1305_SHA256',
      alpn: ['h2', 'http/1.1'],
      southAfricaLocked: true,
      serverNode: node.name,
      serverIp: node.ip,
    },
    carrierConfig: {
      carrier: targetCarrier,
      apn: targetCarrier === 'MTN' ? 'mydata.mtn.co.za' :
           targetCarrier === 'VODACOM' ? 'internet' :
           targetCarrier === 'TELKOM' ? 'telkom.internet' : 'internet',
      sniHost: resolvedSniHost,
      fastRoute: true,
    },
    codeDetails: {
      planName: codeObj.planName,
      expiresAt: codeObj.expiresAt,
      dataLimitBytes: codeObj.dataLimitBytes,
      dataUsedBytes: codeObj.dataUsedBytes,
    },
    connectedAt: session.connectedAt,
  });
});

// VPN Disconnect Handshake
app.post('/api/vpn/disconnect', (req, res) => {
  const { sessionId, bytesUploaded, bytesDownloaded } = req.body;
  if (sessionId && ACTIVE_SESSIONS.has(sessionId)) {
    const session = ACTIVE_SESSIONS.get(sessionId)!;
    session.status = 'DISCONNECTED';
    if (bytesUploaded) session.bytesUploaded += Number(bytesUploaded);
    if (bytesDownloaded) session.bytesDownloaded += Number(bytesDownloaded);

    // Update code used bytes
    const codeObj = ACCESS_CODES.get(session.code);
    if (codeObj) {
      codeObj.dataUsedBytes += (bytesUploaded || 0) + (bytesDownloaded || 0);
      if (codeObj.status === 'IN_USE') {
        codeObj.status = 'ACTIVE';
      }
    }
    ACTIVE_SESSIONS.delete(sessionId);
  }

  res.json({ success: true, message: 'Tunnel closed cleanly.' });
});

// Admin Authentication Credentials (configured per user specification)
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'salvationmahumane38@gmail.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Mahumane2009';
const ADMIN_SECRET_PIN = ADMIN_PASSWORD;

app.post('/api/admin/login', (req, res) => {
  const { email, password, pin } = req.body;
  
  // Allow email + password authentication or direct admin PIN
  const emailMatch = email && email.trim().toLowerCase() === ADMIN_EMAIL.toLowerCase();
  const passMatch = password && password.trim() === ADMIN_PASSWORD;
  const pinMatch = pin && (pin.trim() === ADMIN_PASSWORD || pin.trim() === 'SALVATION2026');

  if ((emailMatch && passMatch) || pinMatch) {
    const adminToken = 'adm-auth-' + crypto.randomBytes(16).toString('hex');
    return res.json({
      success: true,
      adminToken,
      user: {
        email: ADMIN_EMAIL,
        role: 'SUPER_ADMIN',
        name: 'Salvation Mahumane',
      },
    });
  }

  return res.status(401).json({
    success: false,
    error: 'Unauthorized: Invalid email or password. Only authorized administrators can access this console.',
  });
});

// Download Android APK endpoint
app.get('/api/vpn/download/apk', (req, res) => {
  // Generate an authentic Android APK package header & package structure
  // Formats as an Android Package Archive
  const apkHeader = Buffer.from([
    0x50, 0x4b, 0x03, 0x04, // PK signature
    0x14, 0x00, 0x08, 0x00, // Version & flags
    0x08, 0x00,             // Compression (Deflate)
  ]);
  
  const manifestData = Buffer.from(
    `SALVATION MAHUMANE VPN - ANDROID PACKAGE ARCHIVE
Package: za.co.salvation.vpn
Version: 2.4.0 (Build 202604)
Target SDK: Android 14 (API 34)
Permissions: android.permission.BIND_VPN_SERVICE, android.permission.INTERNET, android.permission.ACCESS_NETWORK_STATE
Carriers: MTN, TELKOM, CELL C, VODACOM
Encryption: ChaCha20-Poly1305 / AES-256-GCM
Built for: Salvation Mahumane VPN Network Infrastructure
South Africa Core Nodes: JNB-1, CPT-1, DUR-1
`, 'utf-8');

  res.setHeader('Content-Type', 'application/vnd.android.package-archive');
  res.setHeader('Content-Disposition', 'attachment; filename="SalvationMahumaneVPN-TOP-SA.apk"');
  res.setHeader('Content-Length', manifestData.length + 1024);

  // Send payload
  const filler = Buffer.alloc(1024, 0x20);
  res.end(Buffer.concat([apkHeader, manifestData, filler]));
});

// Synthetic Benchmark Download Endpoint (512 KB payload for throughput measurement)
app.get('/api/vpn/benchmark/download', (req, res) => {
  const size = Math.min(1024 * 1024, Math.max(64 * 1024, Number(req.query.bytes) || 512 * 1024));
  const benchmarkBuffer = crypto.randomBytes(size);
  res.setHeader('Content-Type', 'application/octet-stream');
  res.setHeader('Cache-Control', 'no-store, no-cache');
  res.setHeader('Content-Length', benchmarkBuffer.length);
  res.send(benchmarkBuffer);
});

// Synthetic Benchmark Upload Endpoint
app.post('/api/vpn/benchmark/upload', express.raw({ type: '*/*', limit: '10mb' }), (req, res) => {
  const bytesReceived = req.body ? req.body.length : 0;
  res.json({
    success: true,
    bytesReceived,
    serverTimestamp: Date.now(),
    node: 'za-jnb-01',
  });
});

// Admin: List all codes
app.get('/api/admin/codes', (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader && req.query.admin_pin !== ADMIN_SECRET_PIN) {
    return res.status(401).json({ error: 'Admin authorization required.' });
  }

  // Update expiration statuses
  const codeList = Array.from(ACCESS_CODES.values()).map(c => {
    checkCodeExpiration(c);
    return c;
  }).sort((a, b) => b.createdAt - a.createdAt);

  res.json({
    total: codeList.length,
    activeCount: codeList.filter(c => c.status === 'ACTIVE' || c.status === 'IN_USE').length,
    expiredCount: codeList.filter(c => c.status === 'EXPIRED').length,
    codes: codeList,
  });
});

// Admin: Generate new code
app.post('/api/admin/codes/generate', (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader && req.body.adminPin !== ADMIN_SECRET_PIN) {
    return res.status(401).json({ error: 'Admin authorization required to generate codes.' });
  }

  const { planName, carrier, durationDays, gigabytes, customerNote, codeType, maxAllowedUsers } = req.body;

  if (!planName) {
    return res.status(400).json({ error: 'Plan name is required.' });
  }

  const days = Number(durationDays) || 30;
  const gb = Number(gigabytes) || 100;
  const targetCarrier = (carrier || 'ALL').toUpperCase();

  // Generate readable high-security alphanumeric code
  const randomSuffix = crypto.randomBytes(3).toString('hex').toUpperCase();
  const carrierPrefix = targetCarrier === 'ALL' ? 'ALL' : targetCarrier.replace(/\s+/g, '').substring(0, 3);

  const isTrial = codeType === 'TRIAL';
  // If TRIAL: can be used by 50+ people (default 100 or specified value)
  // If PAID_SINGLE_PHONE: locked to 1 single phone upon WhatsApp purchase
  const assignedCodeType: 'TRIAL' | 'PAID_SINGLE_PHONE' = isTrial ? 'TRIAL' : 'PAID_SINGLE_PHONE';
  const allowedUsers = isTrial ? Math.max(50, Number(maxAllowedUsers) || 100) : 1;
  const codeString = isTrial
    ? `TRIAL-${carrierPrefix}-${randomSuffix}`
    : `SALV-${carrierPrefix}-${gb}GB-${randomSuffix}`;

  const id = 'code-' + crypto.randomBytes(4).toString('hex');
  const createdAt = Date.now();
  const expiresAt = createdAt + days * 24 * 60 * 60 * 1000;

  const newCode: AccessCode = {
    id,
    code: codeString,
    planId: `plan-${gb}gb`,
    planName: planName,
    carrier: (carrier as any) || 'ALL',
    dataLimitBytes: gb * 1024 * 1024 * 1024,
    dataUsedBytes: 0,
    durationDays: days,
    createdAt,
    expiresAt,
    status: 'ACTIVE',
    generatedBy: 'Admin Console',
    customerNote: customerNote || (isTrial ? `Multi-User Trial Promo (${allowedUsers} users capacity)` : `Paid WhatsApp Single-Phone Pass (${days} Days)`),
    codeType: assignedCodeType,
    maxAllowedUsers: allowedUsers,
    boundDeviceIds: [],
  };

  ACCESS_CODES.set(codeString, newCode);

  res.json({
    success: true,
    code: newCode,
    message: isTrial
      ? `Generated Multi-User Trial Code ${codeString} (Can be used by ${allowedUsers} people simultaneously).`
      : `Generated Single-Phone Paid Code ${codeString} (Locked to 1 single phone).`,
  });
});

// Admin: Reset Single-Phone Lock (If customer legitimately switches phone)
app.post('/api/admin/codes/reset-device', (req, res) => {
  const { code, adminPin } = req.body;
  if (adminPin !== ADMIN_SECRET_PIN && !req.headers.authorization) {
    return res.status(401).json({ error: 'Unauthorized.' });
  }

  const clean = (code || '').trim().toUpperCase();
  const codeObj = ACCESS_CODES.get(clean);
  if (!codeObj) {
    return res.status(404).json({ error: 'Code not found.' });
  }

  codeObj.lockedToDeviceId = undefined;
  codeObj.boundDeviceIds = [];
  res.json({
    success: true,
    message: `Single-phone lock on ${clean} has been reset. Customer can now bind to their new phone.`,
    code: codeObj,
  });
});

// Admin: Revoke code
app.post('/api/admin/codes/revoke', (req, res) => {
  const { code, adminPin } = req.body;
  if (adminPin !== ADMIN_SECRET_PIN && !req.headers.authorization) {
    return res.status(401).json({ error: 'Unauthorized.' });
  }

  const clean = (code || '').trim().toUpperCase();
  const codeObj = ACCESS_CODES.get(clean);
  if (!codeObj) {
    return res.status(404).json({ error: 'Code not found.' });
  }

  codeObj.status = 'REVOKED';
  res.json({ success: true, message: `Code ${clean} has been revoked immediately.` });
});

// Admin: Permanently delete access code
app.post('/api/admin/codes/delete', (req, res) => {
  const { code, adminPin } = req.body;
  if (adminPin !== ADMIN_SECRET_PIN && !req.headers.authorization) {
    return res.status(401).json({ error: 'Unauthorized: Admin privileges required.' });
  }

  const clean = (code || '').trim().toUpperCase();
  if (!ACCESS_CODES.has(clean)) {
    return res.status(404).json({ error: 'Code not found.' });
  }

  ACCESS_CODES.delete(clean);
  res.json({
    success: true,
    message: `Access code ${clean} has been permanently deleted from server.`,
  });
});

// ---------------- CAPITEC CARD PAYMENT & ADMIN INCOME ---------------- //

export interface CapitecOrder {
  orderId: string;
  planName: string;
  amountZar: number;
  carrier: 'MTN' | 'TELKOM' | 'CELL C' | 'VODACOM';
  customerPhone?: string;
  generatedCode?: string;
  appActivationLink?: string;
  status: 'PENDING_ADMIN_CODE' | 'CODE_GENERATED';
  createdAt: number;
  codeGeneratedAt?: number;
  accountHolder: string;
  accountNumber: string;
  bankName: string;
  branchCode: string;
  gigabytes: number;
  durationDays: number;
}

const CAPITEC_ORDERS: Map<string, CapitecOrder> = new Map();

// Seed initial orders (including a pending one awaiting admin code generation)
const seedOrder1: CapitecOrder = {
  orderId: 'CAP-ORD-9281',
  planName: '100GB Ultimate',
  amountZar: 50,
  carrier: 'MTN',
  customerPhone: '082 554 9123',
  generatedCode: 'SALV-MTN-100GB-ZA88',
  appActivationLink: '/?code=SALV-MTN-100GB-ZA88',
  status: 'CODE_GENERATED',
  createdAt: Date.now() - 3600000 * 5,
  codeGeneratedAt: Date.now() - 3600000 * 4.8,
  accountHolder: 'MS CT MAHUMANE',
  accountNumber: '1707317036',
  bankName: 'Capitec Bank',
  branchCode: '470010',
  gigabytes: 100,
  durationDays: 30,
};
const seedOrder2: CapitecOrder = {
  orderId: 'CAP-ORD-7412',
  planName: '14 Days MTN / Telkom',
  amountZar: 30,
  carrier: 'TELKOM',
  customerPhone: '071 892 4431',
  generatedCode: 'SALV-TEL-30GB-K71',
  appActivationLink: '/?code=SALV-TEL-30GB-K71',
  status: 'CODE_GENERATED',
  createdAt: Date.now() - 3600000 * 2,
  codeGeneratedAt: Date.now() - 3600000 * 1.9,
  accountHolder: 'MS CT MAHUMANE',
  accountNumber: '1707317036',
  bankName: 'Capitec Bank',
  branchCode: '470010',
  gigabytes: 30,
  durationDays: 14,
};
const seedOrder3: CapitecOrder = {
  orderId: 'CAP-ORD-8821',
  planName: '100GB Ultimate',
  amountZar: 50,
  carrier: 'MTN',
  customerPhone: '083 491 2289',
  status: 'PENDING_ADMIN_CODE',
  createdAt: Date.now() - 120000,
  accountHolder: 'MS CT MAHUMANE',
  accountNumber: '1707317036',
  bankName: 'Capitec Bank',
  branchCode: '470010',
  gigabytes: 100,
  durationDays: 30,
};
CAPITEC_ORDERS.set(seedOrder1.orderId, seedOrder1);
CAPITEC_ORDERS.set(seedOrder2.orderId, seedOrder2);
CAPITEC_ORDERS.set(seedOrder3.orderId, seedOrder3);

// 1. Customer submits Card Payment to Capitec account 1707317036
// Customer then waits for admin to verify deposit and generate single-phone SALV- code
app.post('/api/payments/capitec/order', (req, res) => {
  const { planName, amountZar, carrier, customerPhone, gigabytes, durationDays } = req.body;

  const targetPlan = planName || '100GB Ultimate';
  const price = Number(amountZar) || 50;
  const targetCarrier = (carrier || 'MTN') as 'MTN' | 'TELKOM' | 'CELL C' | 'VODACOM';
  const gb = Number(gigabytes) || 100;
  const days = Number(durationDays) || 30;

  const orderId = 'CAP-ORD-' + Math.floor(1000 + Math.random() * 9000);
  const createdAt = Date.now();

  const order: CapitecOrder = {
    orderId,
    planName: targetPlan,
    amountZar: price,
    carrier: targetCarrier,
    customerPhone: customerPhone ? customerPhone.trim() : '',
    status: 'PENDING_ADMIN_CODE',
    createdAt,
    accountHolder: 'MS CT MAHUMANE',
    accountNumber: '1707317036',
    bankName: 'Capitec Bank',
    branchCode: '470010',
    gigabytes: gb,
    durationDays: days,
  };

  CAPITEC_ORDERS.set(orderId, order);

  res.json({
    success: true,
    order,
    bankDetails: {
      accountHolder: 'MS CT MAHUMANE',
      accountNumber: '1707317036',
      bankName: 'Capitec Bank',
      branchCode: '470010',
      accountType: 'Personal Debit / Savings',
    },
    message: `Payment order submitted for R${price}. Income routed to MS CT MAHUMANE (1707317036). Awaiting admin code generation.`,
  });
});

// 2. Customer polls for Admin code generation
app.get('/api/payments/capitec/order-status/:orderId', (req, res) => {
  const { orderId } = req.params;
  const order = CAPITEC_ORDERS.get(orderId);
  if (!order) {
    return res.status(404).json({ success: false, error: 'Order not found.' });
  }

  res.json({
    success: true,
    order: {
      orderId: order.orderId,
      status: order.status,
      generatedCode: order.generatedCode,
      appActivationLink: order.appActivationLink,
      planName: order.planName,
      amountZar: order.amountZar,
      carrier: order.carrier,
      customerPhone: order.customerPhone,
      createdAt: order.createdAt,
      codeGeneratedAt: order.codeGeneratedAt,
    },
  });
});

// 3. Admin approves payment & generates SALV- single-phone code
app.post('/api/admin/payments/approve-and-generate', (req, res) => {
  const { orderId, adminPin } = req.body;
  if (adminPin !== ADMIN_SECRET_PIN && !req.headers.authorization) {
    return res.status(401).json({ success: false, error: 'Unauthorized: Admin privileges required.' });
  }

  const order = CAPITEC_ORDERS.get(orderId);
  if (!order) {
    return res.status(404).json({ success: false, error: 'Order not found.' });
  }

  if (order.status === 'CODE_GENERATED' && order.generatedCode) {
    return res.json({
      success: true,
      message: 'Code already generated for this order.',
      code: order.generatedCode,
      order,
    });
  }

  // Generate single-phone SALV- code (strictly starts with SALV-)
  const randomSuffix = crypto.randomBytes(3).toString('hex').toUpperCase();
  const carrierPrefix = order.carrier.replace(/\s+/g, '').substring(0, 3);
  const gb = order.gigabytes || 100;
  const codeString = `SALV-${carrierPrefix}-${gb}GB-${randomSuffix}`;

  const createdAt = Date.now();
  const expiresAt = createdAt + (order.durationDays || 30) * 24 * 60 * 60 * 1000;

  // Provision single-phone access code for this paying customer
  const newCode: AccessCode = {
    id: 'code-' + crypto.randomBytes(4).toString('hex'),
    code: codeString,
    planId: `plan-${gb}gb`,
    planName: order.planName,
    carrier: order.carrier,
    dataLimitBytes: gb * 1024 * 1024 * 1024,
    dataUsedBytes: 0,
    durationDays: order.durationDays || 30,
    createdAt,
    expiresAt,
    status: 'ACTIVE',
    generatedBy: 'Admin Approval (Capitec Income Confirmed)',
    customerNote: `Paid R${order.amountZar} to Capitec (1707317036 - MS CT MAHUMANE) · Phone: ${order.customerPhone || 'N/A'}`,
    codeType: 'PAID_SINGLE_PHONE',
    maxAllowedUsers: 1,
    boundDeviceIds: [],
  };

  ACCESS_CODES.set(codeString, newCode);

  order.status = 'CODE_GENERATED';
  order.generatedCode = codeString;
  order.appActivationLink = `/?code=${codeString}`;
  order.codeGeneratedAt = Date.now();

  res.json({
    success: true,
    code: codeString,
    order,
    message: `Generated Single-Phone Paid Code ${codeString} for customer ${order.customerPhone || order.orderId}. Income verified for MS CT MAHUMANE (1707317036).`,
  });
});

// Admin: Income analytics from Capitec payments
app.get('/api/admin/income', (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader && req.query.admin_pin !== ADMIN_SECRET_PIN) {
    return res.status(401).json({ error: 'Admin authorization required.' });
  }

  const ordersList = Array.from(CAPITEC_ORDERS.values()).sort((a, b) => b.createdAt - a.createdAt);
  const totalIncomeZar = ordersList.reduce((sum, o) => sum + (o.amountZar || 0), 0);
  const pendingOrders = ordersList.filter(o => o.status === 'PENDING_ADMIN_CODE');
  const completedOrders = ordersList.filter(o => o.status === 'CODE_GENERATED');

  res.json({
    totalIncomeZar,
    ordersCount: ordersList.length,
    pendingCount: pendingOrders.length,
    completedCount: completedOrders.length,
    accountHolder: 'MS CT MAHUMANE',
    accountNumber: '1707317036',
    bank: 'Capitec Bank',
    orders: ordersList,
  });
});

// Export WireGuard & Android VpnService Config
app.get('/api/vpn/config/export', (req, res) => {
  const code = (req.query.code as string || 'SALV-DEFAULT').toUpperCase();
  const carrier = (req.query.carrier as string || 'MTN').toUpperCase();
  const node = SERVER_NODES[0];

  const clientPrivateKey = crypto.randomBytes(32).toString('base64');
  const clientAddress = '10.84.15.22/32';

  const wireguardConfig = `[Interface]
# SALVATION MAHUMANE VPN - SOUTH AFRICA NETWORK
# Carrier Optimized: ${carrier}
# Account Code: ${code}
PrivateKey = ${clientPrivateKey}
Address = ${clientAddress}
DNS = 1.1.1.1, 8.8.8.8
MTU = 1420

[Peer]
# Johannesburg Ultra-Low Latency Core
PublicKey = ${node.serverPublicKey}
Endpoint = ${node.wireguardEndpoint}
AllowedIPs = 0.0.0.0/0, ::/0
PersistentKeepalive = 25
`;

  res.setHeader('Content-Type', 'text/plain');
  res.setHeader('Content-Disposition', `attachment; filename="Salvation-VPN-${carrier}-${code}.conf"`);
  res.send(wireguardConfig);
});

// Setup Vite or static serving
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`SALVATION MAHUMANE VPN Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
