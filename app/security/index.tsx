import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import {
  getAuditLog,
  clearAuditLog,
  getRateLimitStatus,
  AuditEvent,
} from '@/utils/security';
import { getClaudeApiKey, getAyrshareApiKey, getMetaAccessToken, getMetaAdAccountId } from '@/services/storage/secureStorage';
import { createClaudeService } from '@/services/claude/claudeService';
import { createAyrshareService } from '@/services/ayrshare/ayrshareService';
import { createMetaAdsService } from '@/services/metaAds/metaAdsService';

// ─── Constants ─────────────────────────────────────────────────────────────────

const C = {
  bg: '#0A0A1A',
  surface: '#141428',
  card: '#1C1C35',
  border: '#2A2A45',
  primary: '#7C3AED',
  accent: '#10B981',
  error: '#EF4444',
  warning: '#F59E0B',
  info: '#3B82F6',
  textPrimary: '#FFFFFF',
  textSecondary: '#A0A0C0',
  textMuted: '#606080',
};

// ─── Types ──────────────────────────────────────────────────────────────────────

type ServiceStatus = 'valid' | 'invalid' | 'unconfigured' | 'checking';

interface ServiceState {
  label: string;
  service: 'claude' | 'ayrshare' | 'meta';
  icon: string;
  status: ServiceStatus;
  maskedKey: string;
  detail: string;
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

function maskSecret(value: string | null | undefined): string {
  if (!value || value.length === 0) return 'Not configured';
  if (value.length <= 8) return '••••••••';
  return '••••••••' + value.slice(-4);
}

function severityColor(severity: AuditEvent['severity']): string {
  if (severity === 'error') return C.error;
  if (severity === 'warning') return C.warning;
  return C.info;
}

function severityIcon(severity: AuditEvent['severity']): string {
  if (severity === 'error') return 'close-circle-outline';
  if (severity === 'warning') return 'warning-outline';
  return 'information-circle-outline';
}

function statusColor(status: ServiceStatus): string {
  if (status === 'valid') return C.accent;
  if (status === 'invalid') return C.error;
  if (status === 'checking') return C.warning;
  return C.textMuted;
}

function statusLabel(status: ServiceStatus): string {
  if (status === 'valid') return 'Connected';
  if (status === 'invalid') return 'Auth Failed';
  if (status === 'checking') return 'Checking...';
  return 'Not Set';
}

function formatTimestamp(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

// ─── Sub-Components ─────────────────────────────────────────────────────────────

function SectionHeader({ title }: { title: string }) {
  return <Text style={styles.sectionHeader}>{title}</Text>;
}

function SecurityBanner({ allSecure, scanning }: { allSecure: boolean; scanning: boolean }) {
  if (scanning) {
    return (
      <View style={[styles.banner, { backgroundColor: '#1C1A2E', borderColor: C.warning }]}>
        <ActivityIndicator color={C.warning} size="small" />
        <Text style={[styles.bannerTitle, { color: C.warning }]}>Scanning...</Text>
        <Text style={styles.bannerSub}>Verifying all service connections</Text>
      </View>
    );
  }
  return (
    <View
      style={[
        styles.banner,
        { backgroundColor: allSecure ? '#0D1F1A' : '#1F0D0D', borderColor: allSecure ? C.accent : C.error },
      ]}
    >
      <Ionicons
        name={allSecure ? 'shield-checkmark' : 'shield-outline'}
        size={36}
        color={allSecure ? C.accent : C.error}
      />
      <Text style={[styles.bannerTitle, { color: allSecure ? C.accent : C.error }]}>
        {allSecure ? 'All Systems Secure' : 'Issues Detected'}
      </Text>
      <Text style={styles.bannerSub}>
        {allSecure
          ? 'All API connections authenticated. Credentials encrypted on-device.'
          : 'One or more services failed validation. Review the status below.'}
      </Text>
    </View>
  );
}

function ServiceRow({ item, onRecheck }: { item: ServiceState; onRecheck: () => void }) {
  const color = statusColor(item.status);
  return (
    <View style={styles.serviceRow}>
      <View style={[styles.serviceIconBox, { backgroundColor: `${color}22` }]}>
        <Ionicons name={item.icon as any} size={22} color={color} />
      </View>
      <View style={styles.serviceInfo}>
        <Text style={styles.serviceLabel}>{item.label}</Text>
        <Text style={styles.serviceKey}>{item.maskedKey}</Text>
        {item.detail ? <Text style={styles.serviceDetail}>{item.detail}</Text> : null}
      </View>
      <View style={styles.serviceRight}>
        <View style={[styles.statusDot, { backgroundColor: color }]} />
        <Text style={[styles.statusText, { color }]}>{statusLabel(item.status)}</Text>
      </View>
    </View>
  );
}

function RateLimitCard({
  label,
  rateLimitKey,
  max,
  windowMs,
}: {
  label: string;
  rateLimitKey: string;
  max: number;
  windowMs: number;
}) {
  const { remaining, resetsInMs } = getRateLimitStatus(rateLimitKey, max, windowMs);
  const pct = remaining / max;
  const barColor = pct > 0.5 ? C.accent : pct > 0.2 ? C.warning : C.error;
  const resetsIn =
    resetsInMs > 0
      ? resetsInMs > 60_000
        ? `${Math.ceil(resetsInMs / 60_000)}m`
        : `${Math.ceil(resetsInMs / 1000)}s`
      : 'Now';

  return (
    <View style={styles.rlCard}>
      <View style={styles.rlHeader}>
        <Text style={styles.rlLabel}>{label}</Text>
        <Text style={[styles.rlCount, { color: barColor }]}>
          {remaining}/{max}
        </Text>
      </View>
      <View style={styles.rlBarBg}>
        <View style={[styles.rlBar, { width: `${Math.round(pct * 100)}%`, backgroundColor: barColor }]} />
      </View>
      <Text style={styles.rlReset}>
        Resets: {resetsIn} · Window: {Math.round(windowMs / 1000)}s
      </Text>
    </View>
  );
}

function AuditLogRow({ event }: { event: AuditEvent }) {
  const color = severityColor(event.severity);
  const icon = severityIcon(event.severity);
  return (
    <View style={styles.logRow}>
      <Ionicons name={icon as any} size={14} color={color} style={{ marginTop: 1 }} />
      <View style={styles.logContent}>
        <View style={styles.logMeta}>
          <Text style={[styles.logService, { color }]}>{event.service.toUpperCase()}</Text>
          <Text style={styles.logTime}>{formatTimestamp(event.timestamp)}</Text>
        </View>
        <Text style={styles.logMessage}>{event.message}</Text>
      </View>
    </View>
  );
}

// ─── Main Screen ────────────────────────────────────────────────────────────────

export default function SecurityCenterScreen() {
  const [services, setServices] = useState<ServiceState[]>([
    { label: 'Claude AI', service: 'claude', icon: 'sparkles-outline', status: 'unconfigured', maskedKey: 'Not configured', detail: '' },
    { label: 'Ayrshare', service: 'ayrshare', icon: 'share-social-outline', status: 'unconfigured', maskedKey: 'Not configured', detail: '' },
    { label: 'Meta Ads', service: 'meta', icon: 'logo-facebook', status: 'unconfigured', maskedKey: 'Not configured', detail: '' },
  ]);
  const [scanning, setScanning] = useState(false);
  const [auditLog, setAuditLog] = useState<AuditEvent[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const allSecure =
    !scanning &&
    services.every((s) => s.status === 'valid' || s.status === 'unconfigured') &&
    services.some((s) => s.status === 'valid');

  const refreshLog = useCallback(() => {
    setAuditLog(getAuditLog());
  }, []);

  const runScan = useCallback(async () => {
    setScanning(true);

    const [claudeKey, ayrshareKey, metaToken, metaAccountId] = await Promise.all([
      getClaudeApiKey(),
      getAyrshareApiKey(),
      getMetaAccessToken(),
      getMetaAdAccountId(),
    ]);

    const updated: ServiceState[] = [];

    // Claude
    if (!claudeKey) {
      updated.push({ label: 'Claude AI', service: 'claude', icon: 'sparkles-outline', status: 'unconfigured', maskedKey: 'Not configured', detail: '' });
    } else {
      try {
        const ok = await createClaudeService(claudeKey).validateApiKey();
        updated.push({
          label: 'Claude AI',
          service: 'claude',
          icon: 'sparkles-outline',
          status: ok ? 'valid' : 'invalid',
          maskedKey: maskSecret(claudeKey),
          detail: ok ? 'API key authenticated' : 'Authentication failed',
        });
      } catch {
        updated.push({ label: 'Claude AI', service: 'claude', icon: 'sparkles-outline', status: 'invalid', maskedKey: maskSecret(claudeKey), detail: 'Validation error' });
      }
    }

    // Ayrshare
    if (!ayrshareKey) {
      updated.push({ label: 'Ayrshare', service: 'ayrshare', icon: 'share-social-outline', status: 'unconfigured', maskedKey: 'Not configured', detail: '' });
    } else {
      try {
        const ok = await createAyrshareService(ayrshareKey).validateApiKey();
        updated.push({
          label: 'Ayrshare',
          service: 'ayrshare',
          icon: 'share-social-outline',
          status: ok ? 'valid' : 'invalid',
          maskedKey: maskSecret(ayrshareKey),
          detail: ok ? 'API key authenticated' : 'Authentication failed',
        });
      } catch {
        updated.push({ label: 'Ayrshare', service: 'ayrshare', icon: 'share-social-outline', status: 'invalid', maskedKey: maskSecret(ayrshareKey), detail: 'Validation error' });
      }
    }

    // Meta Ads
    if (!metaToken || !metaAccountId) {
      updated.push({ label: 'Meta Ads', service: 'meta', icon: 'logo-facebook', status: 'unconfigured', maskedKey: metaToken ? maskSecret(metaToken) : 'Not configured', detail: metaAccountId ? `Account: ${metaAccountId}` : '' });
    } else {
      try {
        const ok = await createMetaAdsService(metaToken).validateToken();
        updated.push({
          label: 'Meta Ads',
          service: 'meta',
          icon: 'logo-facebook',
          status: ok ? 'valid' : 'invalid',
          maskedKey: maskSecret(metaToken),
          detail: ok ? `Account: ${metaAccountId}` : 'Token authentication failed',
        });
      } catch {
        updated.push({ label: 'Meta Ads', service: 'meta', icon: 'logo-facebook', status: 'invalid', maskedKey: maskSecret(metaToken), detail: 'Validation error' });
      }
    }

    setServices(updated);
    setAuditLog(getAuditLog());
    setScanning(false);
  }, []);

  useEffect(() => {
    refreshLog();
    // Populate initial key presence without live validation
    (async () => {
      const [claudeKey, ayrshareKey, metaToken, metaAccountId] = await Promise.all([
        getClaudeApiKey(),
        getAyrshareApiKey(),
        getMetaAccessToken(),
        getMetaAdAccountId(),
      ]);
      setServices([
        {
          label: 'Claude AI', service: 'claude', icon: 'sparkles-outline',
          status: claudeKey ? 'unconfigured' : 'unconfigured',
          maskedKey: maskSecret(claudeKey),
          detail: claudeKey ? 'Key present — tap Scan to verify' : '',
        },
        {
          label: 'Ayrshare', service: 'ayrshare', icon: 'share-social-outline',
          status: 'unconfigured',
          maskedKey: maskSecret(ayrshareKey),
          detail: ayrshareKey ? 'Key present — tap Scan to verify' : '',
        },
        {
          label: 'Meta Ads', service: 'meta', icon: 'logo-facebook',
          status: 'unconfigured',
          maskedKey: maskSecret(metaToken),
          detail: metaAccountId ? `Account ID: ${metaAccountId}` : '',
        },
      ]);
    })();
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await runScan();
    setRefreshing(false);
  }, [runScan]);

  const handleClearLog = () => {
    Alert.alert(
      'Clear Audit Log',
      'This will erase all recorded security events. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: () => {
            clearAuditLog();
            setAuditLog([]);
          },
        },
      ]
    );
  };

  const configuredCount = services.filter((s) => s.status !== 'unconfigured').length;
  const validCount = services.filter((s) => s.status === 'valid').length;
  const errorCount = services.filter((s) => s.status === 'invalid').length;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={C.bg} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} activeOpacity={0.75} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={C.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Security Center</Text>
        <TouchableOpacity
          onPress={runScan}
          activeOpacity={0.75}
          style={styles.scanBtn}
          disabled={scanning}
        >
          {scanning ? (
            <ActivityIndicator color={C.primary} size="small" />
          ) : (
            <Ionicons name="scan-outline" size={22} color={C.primary} />
          )}
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={C.primary} />}
      >
        {/* Banner */}
        <SecurityBanner allSecure={allSecure} scanning={scanning} />

        {/* Stats row */}
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={[styles.statNum, { color: C.accent }]}>{validCount}</Text>
            <Text style={styles.statLbl}>Verified</Text>
          </View>
          <View style={[styles.statDivider]} />
          <View style={styles.statBox}>
            <Text style={[styles.statNum, { color: C.error }]}>{errorCount}</Text>
            <Text style={styles.statLbl}>Failed</Text>
          </View>
          <View style={[styles.statDivider]} />
          <View style={styles.statBox}>
            <Text style={[styles.statNum, { color: C.textSecondary }]}>{auditLog.length}</Text>
            <Text style={styles.statLbl}>Log Events</Text>
          </View>
        </View>

        {/* Service Connections */}
        <SectionHeader title="API Connections" />
        <View style={styles.card}>
          {services.map((item, idx) => (
            <React.Fragment key={item.service}>
              <ServiceRow item={item} onRecheck={runScan} />
              {idx < services.length - 1 && <View style={styles.separator} />}
            </React.Fragment>
          ))}
        </View>

        {/* Security Practices */}
        <SectionHeader title="Security Practices" />
        <View style={styles.card}>
          {[
            { icon: 'lock-closed-outline', color: C.accent, label: 'Encrypted Storage', detail: 'All API keys stored in platform keychain / keystore via Expo SecureStore' },
            { icon: 'shield-outline', color: C.accent, label: 'Token-in-Header', detail: 'Access tokens sent via Authorization: Bearer header — never in URLs or logs' },
            { icon: 'speedometer-outline', color: C.accent, label: 'Rate Limiting', detail: 'Client-side sliding window prevents brute-force attacks on all endpoints' },
            { icon: 'eye-off-outline', color: C.accent, label: 'Error Sanitisation', detail: 'All error messages scrubbed of tokens and secrets before reaching the UI' },
            { icon: 'code-slash-outline', color: C.accent, label: 'Safe JSON Parsing', detail: 'LLM and API responses capped at 200 KB to prevent memory exhaustion' },
            { icon: 'git-branch-outline', color: C.accent, label: 'Stream Guard', detail: 'Claude streaming responses limited to 50 KB to prevent runaway accumulation' },
          ].map((item) => (
            <View key={item.label} style={styles.practiceRow}>
              <View style={[styles.practiceIconBox, { backgroundColor: `${item.color}22` }]}>
                <Ionicons name={item.icon as any} size={18} color={item.color} />
              </View>
              <View style={styles.practiceText}>
                <Text style={styles.practiceLabel}>{item.label}</Text>
                <Text style={styles.practiceDetail}>{item.detail}</Text>
              </View>
              <Ionicons name="checkmark-circle" size={18} color={C.accent} />
            </View>
          ))}
        </View>

        {/* Rate Limit Status */}
        <SectionHeader title="Rate Limit Status" />
        <View style={styles.card}>
          <RateLimitCard label="Claude — Key Validation" rateLimitKey="claude_key_validate" max={3} windowMs={60_000} />
          <View style={styles.separator} />
          <RateLimitCard label="Ayrshare — Key Validation" rateLimitKey="ayrshare_key_validate" max={3} windowMs={60_000} />
          <View style={styles.separator} />
          <RateLimitCard label="Meta Ads — Token Validation" rateLimitKey="meta_token_validate" max={3} windowMs={60_000} />
          <View style={styles.separator} />
          <RateLimitCard label="Meta Ads — API Requests" rateLimitKey="meta_api_request" max={30} windowMs={10_000} />
          <View style={styles.separator} />
          <RateLimitCard label="Ad Copy — Generation" rateLimitKey="ad_copy_generate" max={20} windowMs={60_000} />
        </View>

        {/* Audit Log */}
        <View style={styles.auditHeader}>
          <SectionHeader title="Security Audit Log" />
          <TouchableOpacity onPress={handleClearLog} activeOpacity={0.75} style={styles.clearBtn}>
            <Ionicons name="trash-outline" size={15} color={C.textMuted} />
            <Text style={styles.clearBtnText}>Clear</Text>
          </TouchableOpacity>
        </View>

        {auditLog.length === 0 ? (
          <View style={styles.emptyLog}>
            <Ionicons name="document-text-outline" size={32} color={C.textMuted} />
            <Text style={styles.emptyLogText}>No events recorded yet</Text>
            <Text style={styles.emptyLogSub}>Run a scan or use the app to generate audit events</Text>
          </View>
        ) : (
          <View style={styles.card}>
            {auditLog.map((event, idx) => (
              <React.Fragment key={event.id}>
                <AuditLogRow event={event} />
                {idx < auditLog.length - 1 && <View style={styles.separator} />}
              </React.Fragment>
            ))}
          </View>
        )}

        {/* Scan CTA */}
        <TouchableOpacity
          style={[styles.scanCta, scanning && { opacity: 0.6 }]}
          onPress={runScan}
          activeOpacity={0.85}
          disabled={scanning}
        >
          {scanning ? (
            <ActivityIndicator color={C.textPrimary} size="small" />
          ) : (
            <Ionicons name="shield-checkmark-outline" size={20} color={C.textPrimary} />
          )}
          <Text style={styles.scanCtaText}>{scanning ? 'Running Security Scan...' : 'Run Security Scan'}</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ─────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 20 },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: C.textPrimary },
  scanBtn: { padding: 4 },

  banner: {
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1.5,
    padding: 24,
    gap: 10,
    marginTop: 20,
    marginBottom: 16,
  },
  bannerTitle: { fontSize: 20, fontWeight: '800', letterSpacing: -0.3 },
  bannerSub: { fontSize: 13, color: C.textSecondary, textAlign: 'center', lineHeight: 18 },

  statsRow: {
    flexDirection: 'row',
    backgroundColor: C.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: C.border,
    marginBottom: 24,
    overflow: 'hidden',
  },
  statBox: { flex: 1, alignItems: 'center', paddingVertical: 14 },
  statNum: { fontSize: 22, fontWeight: '800' },
  statLbl: { fontSize: 11, color: C.textMuted, marginTop: 2 },
  statDivider: { width: 1, backgroundColor: C.border, marginVertical: 10 },

  sectionHeader: {
    fontSize: 13,
    fontWeight: '700',
    color: C.textMuted,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: 10,
  },

  card: {
    backgroundColor: C.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: C.border,
    marginBottom: 24,
    overflow: 'hidden',
  },
  separator: { height: 1, backgroundColor: C.border, marginHorizontal: 16 },

  // Service rows
  serviceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  serviceIconBox: {
    width: 42,
    height: 42,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  serviceInfo: { flex: 1 },
  serviceLabel: { fontSize: 15, fontWeight: '600', color: C.textPrimary },
  serviceKey: { fontSize: 12, color: C.textMuted, fontFamily: 'monospace', marginTop: 2 },
  serviceDetail: { fontSize: 11, color: C.textSecondary, marginTop: 2 },
  serviceRight: { alignItems: 'flex-end', gap: 4 },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  statusText: { fontSize: 11, fontWeight: '600' },

  // Practice rows
  practiceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 12,
  },
  practiceIconBox: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  practiceText: { flex: 1 },
  practiceLabel: { fontSize: 14, fontWeight: '600', color: C.textPrimary },
  practiceDetail: { fontSize: 11, color: C.textSecondary, marginTop: 2, lineHeight: 15 },

  // Rate limit
  rlCard: { padding: 14 },
  rlHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  rlLabel: { fontSize: 13, color: C.textSecondary, fontWeight: '500' },
  rlCount: { fontSize: 13, fontWeight: '700' },
  rlBarBg: { height: 5, backgroundColor: C.border, borderRadius: 3, overflow: 'hidden', marginBottom: 6 },
  rlBar: { height: 5, borderRadius: 3 },
  rlReset: { fontSize: 11, color: C.textMuted },

  // Audit log
  auditHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  clearBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingVertical: 4 },
  clearBtnText: { fontSize: 12, color: C.textMuted },

  emptyLog: {
    backgroundColor: C.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: C.border,
    alignItems: 'center',
    padding: 32,
    marginBottom: 24,
    gap: 8,
  },
  emptyLogText: { fontSize: 15, fontWeight: '600', color: C.textSecondary },
  emptyLogSub: { fontSize: 12, color: C.textMuted, textAlign: 'center' },

  logRow: {
    flexDirection: 'row',
    gap: 10,
    padding: 12,
    paddingHorizontal: 14,
  },
  logContent: { flex: 1 },
  logMeta: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 3 },
  logService: { fontSize: 11, fontWeight: '700', letterSpacing: 0.5 },
  logTime: { fontSize: 11, color: C.textMuted },
  logMessage: { fontSize: 12, color: C.textSecondary, lineHeight: 16 },

  // Scan CTA
  scanCta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: C.primary,
    borderRadius: 14,
    paddingVertical: 16,
    marginTop: 4,
    marginBottom: 8,
  },
  scanCtaText: { fontSize: 16, fontWeight: '700', color: C.textPrimary },
});
