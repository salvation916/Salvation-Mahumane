export type Carrier = 'MTN' | 'TELKOM' | 'CELL C' | 'VODACOM';

export type ConnectionState = 'DISCONNECTED' | 'CONNECTING' | 'CONNECTED' | 'ERROR' | 'DISCONNECTING';

export interface VpnLogEntry {
  id: string;
  timestamp: string;
  level: 'INFO' | 'SUCCESS' | 'WARN' | 'ERROR';
  category: 'TUNNEL' | 'AUTH' | 'CARRIER' | 'DNS' | 'HANDSHAKE';
  message: string;
}

export interface DataPlan {
  id: string;
  name: string;
  gigabytes: number;
  priceZar: number;
  promoPriceZar?: number;
  supportedCarriers: Carrier[];
  badge?: string;
  popular?: boolean;
}

export interface AccessCodeRecord {
  id: string;
  code: string;
  planId: string;
  planName: string;
  carrier: Carrier | 'ALL';
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

export interface ServerNode {
  id: string;
  name: string;
  city: string;
  province?: string;
  country: string;
  host: string;
  ip: string;
  latencyBase: number;
  status: string;
  load: number;
  supportedCarriers: string[];
  wireguardEndpoint: string;
  serverPublicKey: string;
}

export const SOUTH_AFRICA_NODES: ServerNode[] = [
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
  },
];

export type TlsMode = 'TLS_DIRECT_SNI' | 'TLS_PAYLOAD' | 'V2RAY_WS_TLS' | 'WIREGUARD';

export const CARRIER_SNI_PRESETS: Record<Carrier, { defaultSni: string; altSni: string[]; apn: string; payloadSnippet: string }> = {
  MTN: {
    defaultSni: 'mydata.mtn.co.za',
    altSni: ['za-mtn.salvation-vpn.co.za', 'musicplus.mtn.co.za', 'pulse.mtn.co.za'],
    apn: 'mydata.mtn.co.za',
    payloadSnippet: 'GET / HTTP/1.1[crlf]Host: mydata.mtn.co.za[crlf]X-Online-Host: mydata.mtn.co.za[crlf]Connection: Keep-Alive[crlf][crlf]',
  },
  TELKOM: {
    defaultSni: 'telkom.internet',
    altSni: ['cms.telkom.co.za', 'touch.telkom.co.za', 'telkom-route.salvation-vpn.co.za'],
    apn: 'telkom.internet',
    payloadSnippet: 'GET / HTTP/1.1[crlf]Host: telkom.internet[crlf]X-Online-Host: telkom.internet[crlf]Connection: Keep-Alive[crlf][crlf]',
  },
  'CELL C': {
    defaultSni: 'customer.cellc.co.za',
    altSni: ['cellc-fast.salvation-vpn.co.za', 'roaming.cellc.co.za', 'internet'],
    apn: 'internet',
    payloadSnippet: 'GET / HTTP/1.1[crlf]Host: customer.cellc.co.za[crlf]X-Online-Host: customer.cellc.co.za[crlf]Connection: Keep-Alive[crlf][crlf]',
  },
  VODACOM: {
    defaultSni: 'vodacom-tunnel.salvation-vpn.co.za',
    altSni: ['video.vodacom.co.za', 'portal.vodacom.co.za', 'internet'],
    apn: 'internet',
    payloadSnippet: 'GET / HTTP/1.1[crlf]Host: video.vodacom.co.za[crlf]X-Online-Host: video.vodacom.co.za[crlf]Connection: Keep-Alive[crlf][crlf]',
  },
};

export interface VpnConnectionDetails {
  sessionId: string;
  sessionToken: string;
  virtualIp: string;
  serverNode: ServerNode;
  dnsServers: string[];
  mtu: number;
  allowedIps: string;
  tlsConfig: {
    tlsMode: TlsMode;
    sniHost: string;
    tlsPort: number;
    tlsVersion: string;
    cipherSuite: string;
    alpn: string[];
    southAfricaLocked: boolean;
  };
  carrierConfig: {
    carrier: Carrier;
    apn: string;
    sniHost: string;
    fastRoute: boolean;
  };
  codeDetails: {
    planName: string;
    expiresAt: number;
    dataLimitBytes: number;
    dataUsedBytes: number;
  };
  connectedAt: number;
}

export interface VpnLiveTelemetry {
  uploadSpeedBps: number;
  downloadSpeedBps: number;
  totalUploadBytes: number;
  totalDownloadBytes: number;
  latencyMs: number;
  jitterMs: number;
  packetLossPercent: number;
  uptimeSeconds: number;
}

export interface PremiumDurationPlan {
  id: string;
  category: 'CELL_C_PREMIUM' | 'MTN_TELKOM_UNLIMITED';
  title: string;
  days: number;
  priceZar: number;
  popular?: boolean;
}

export const CELL_C_PREMIUM_PLANS: PremiumDurationPlan[] = [
  { id: 'cc-2d', category: 'CELL_C_PREMIUM', title: '2 Days Cell C', days: 2, priceZar: 10 },
  { id: 'cc-7d', category: 'CELL_C_PREMIUM', title: '7 Days Cell C', days: 7, priceZar: 25 },
  { id: 'cc-10d', category: 'CELL_C_PREMIUM', title: '10 Days Cell C', days: 10, priceZar: 30 },
  { id: 'cc-14d', category: 'CELL_C_PREMIUM', title: '14 Days Cell C', days: 14, priceZar: 35, popular: true },
  { id: 'cc-20d', category: 'CELL_C_PREMIUM', title: '20 Days Cell C', days: 20, priceZar: 45 },
  { id: 'cc-25d', category: 'CELL_C_PREMIUM', title: '25 Days Cell C', days: 25, priceZar: 60 },
  { id: 'cc-31d', category: 'CELL_C_PREMIUM', title: '31 Days Cell C Full Month', days: 31, priceZar: 80, popular: true },
];

export const MTN_TELKOM_UNLIMITED_PLANS: PremiumDurationPlan[] = [
  { id: 'mt-2d', category: 'MTN_TELKOM_UNLIMITED', title: '2 Days MTN / Telkom', days: 2, priceZar: 10 },
  { id: 'mt-7d', category: 'MTN_TELKOM_UNLIMITED', title: '7 Days MTN / Telkom', days: 7, priceZar: 20 },
  { id: 'mt-14d', category: 'MTN_TELKOM_UNLIMITED', title: '14 Days MTN / Telkom', days: 14, priceZar: 30, popular: true },
  { id: 'mt-20d', category: 'MTN_TELKOM_UNLIMITED', title: '20 Days MTN / Telkom', days: 20, priceZar: 50 },
  { id: 'mt-31d', category: 'MTN_TELKOM_UNLIMITED', title: '31 Days Unlimited Month', days: 31, priceZar: 100, popular: true },
];

export const SUPPORT_CONTACT = {
  phoneNumber: '+27 63 824 9382',
  cleanNumber: '27638249382',
  tagline: "I'm Like A Bot Always Online 24/7",
  paymentMethods: '1voucher And Bank Transfer ✅',
};

// Capitec Bank Account details for admin income (from verified debit card)
export const CAPITEC_BANK_DETAILS = {
  accountHolder: 'MS CT MAHUMANE',
  accountNumber: '1707317036',
  bankName: 'Capitec Bank',
  branchCode: '470010',
  accountType: 'Personal Debit / Savings',
  cardScheme: 'Mastercard Debit',
};

export interface CapitecPaymentOrder {
  orderId: string;
  planName: string;
  amountZar: number;
  carrier: Carrier;
  customerPhone?: string;
  status: 'PENDING_ADMIN_CODE' | 'CODE_GENERATED';
  generatedCode?: string;
  appActivationLink?: string;
  codeGeneratedAt?: number;
  createdAt: number;
  gigabytes?: number;
  durationDays?: number;
}

// All data plans requested in prompt
export const DATA_PLANS: DataPlan[] = [
  {
    id: 'plan-100gb',
    name: '100GB Ultimate',
    gigabytes: 100,
    priceZar: 50,
    supportedCarriers: ['MTN', 'TELKOM', 'VODACOM'],
    popular: true,
    badge: 'BEST SELLER',
  },
  {
    id: 'plan-120gb',
    name: '120GB Ultra Stream',
    gigabytes: 120,
    priceZar: 90,
    supportedCarriers: ['MTN', 'TELKOM', 'VODACOM'],
  },
  {
    id: 'plan-140gb',
    name: '140GB Power User',
    gigabytes: 140,
    priceZar: 110,
    supportedCarriers: ['MTN', 'TELKOM', 'VODACOM'],
  },
  {
    id: 'plan-180gb',
    name: '180GB Mega Pass',
    gigabytes: 180,
    priceZar: 150,
    promoPriceZar: 100,
    supportedCarriers: ['MTN', 'TELKOM', 'VODACOM'],
    badge: 'SPECIAL OFFER',
  },
  {
    id: 'plan-99gb',
    name: '99GB Daily Max',
    gigabytes: 99,
    priceZar: 49,
    supportedCarriers: ['MTN', 'TELKOM', 'VODACOM'],
    popular: true,
  },
  {
    id: 'plan-89gb',
    name: '89GB High Speed',
    gigabytes: 89,
    priceZar: 48,
    supportedCarriers: ['MTN', 'TELKOM', 'VODACOM'],
  },
  {
    id: 'plan-70gb',
    name: '70GB Value Saver',
    gigabytes: 70,
    priceZar: 37,
    supportedCarriers: ['MTN', 'TELKOM', 'VODACOM'],
  },
  {
    id: 'plan-6gb',
    name: '6GB Quick Boost',
    gigabytes: 6,
    priceZar: 39,
    supportedCarriers: ['MTN', 'TELKOM', 'VODACOM'],
  },
  {
    id: 'plan-54gb',
    name: '54GB Economy Pack',
    gigabytes: 54,
    priceZar: 54,
    supportedCarriers: ['MTN', 'TELKOM', 'VODACOM'],
  },
];
