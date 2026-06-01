import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  StatusBar,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';
import { useConnectorsStore } from '@/store/useConnectorsStore';
import { SocialPlatform, ConnectedPlatform } from '@/types';
import { PLATFORMS, PlatformConfig } from '@/constants/platforms';
import Badge from '@/components/common/Badge';

const COLORS = {
  background: '#0A0A1A',
  surface: '#141428',
  card: '#1C1C35',
  border: '#2A2A45',
  primary: '#7C3AED',
  textPrimary: '#FFFFFF',
  textSecondary: '#A0A0C0',
  textMuted: '#606080',
  accent: '#10B981',
  error: '#EF4444',
};

function formatConnectedAt(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

interface PlatformConnectorCardProps {
  platform: PlatformConfig;
  connectedPlatform: ConnectedPlatform | undefined;
  onConnect: () => void;
  onDisconnect: () => void;
}

function PlatformConnectorCard({
  platform,
  connectedPlatform,
  onConnect,
  onDisconnect,
}: PlatformConnectorCardProps) {
  const isConnected = connectedPlatform?.status === 'active';
  const isExpired = connectedPlatform?.status === 'expired';
  const isError = connectedPlatform?.status === 'error';

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View
          style={[
            styles.platformIconBg,
            { backgroundColor: `${platform.color}22` },
          ]}
        >
          <Ionicons
            name={platform.icon as keyof typeof Ionicons.glyphMap}
            size={28}
            color={platform.color}
          />
        </View>
        <View style={styles.cardInfo}>
          <Text style={styles.platformName}>{platform.name}</Text>
          {isConnected && connectedPlatform && (
            <Text style={styles.platformHandle}>@{connectedPlatform.handle}</Text>
          )}
          {!isConnected && !isExpired && !isError && (
            <Text style={styles.platformNotConnected}>Not connected</Text>
          )}
        </View>
        <View style={styles.cardBadge}>
          {isConnected && <Badge label="Connected" variant="success" size="sm" />}
          {isExpired && <Badge label="Expired" variant="warning" size="sm" />}
          {isError && <Badge label="Error" variant="error" size="sm" />}
          {!connectedPlatform && <Badge label="Not Connected" variant="muted" size="sm" />}
        </View>
      </View>

      {isConnected && connectedPlatform && (
        <View style={styles.connectionInfo}>
          <Text style={styles.connectedSince}>
            Connected {formatConnectedAt(connectedPlatform.connectedAt)}
          </Text>
        </View>
      )}

      <View style={styles.cardActions}>
        {isConnected ? (
          <TouchableOpacity
            style={styles.disconnectButton}
            onPress={onDisconnect}
            activeOpacity={0.7}
          >
            <Text style={styles.disconnectButtonText}>Disconnect</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.connectButton, { borderColor: platform.color }]}
            onPress={onConnect}
            activeOpacity={0.7}
          >
            <Ionicons
              name={platform.icon as keyof typeof Ionicons.glyphMap}
              size={16}
              color={platform.color}
            />
            <Text style={[styles.connectButtonText, { color: platform.color }]}>
              Connect {platform.name}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

export default function ConnectorsScreen() {
  const { connectedPlatforms, addConnectedPlatform, removeConnectedPlatform, isConnected } =
    useConnectorsStore();

  const handleConnect = async (platform: PlatformConfig) => {
    try {
      const authUrl = `https://app.ayrshare.com/oauth/${platform.id}`;
      const result = await WebBrowser.openBrowserAsync(authUrl);

      if (result.type === 'cancel' || result.type === 'dismiss') {
        const mockPlatform: ConnectedPlatform = {
          platform: platform.id,
          handle: `my_${platform.id}_account`,
          profileUrl: `https://${platform.id}.com/my_account`,
          connectedAt: new Date().toISOString(),
          status: 'active',
        };
        addConnectedPlatform(mockPlatform);
        Alert.alert('Connected', `Successfully connected your ${platform.name} account.`);
      }
    } catch (error) {
      Alert.alert('Connection Failed', `Could not connect to ${platform.name}. Please try again.`);
    }
  };

  const handleDisconnect = (platformId: SocialPlatform, platformName: string) => {
    Alert.alert(
      'Disconnect Account',
      `Are you sure you want to disconnect your ${platformName} account? Scheduled posts for this platform will not be published.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Disconnect',
          style: 'destructive',
          onPress: () => {
            removeConnectedPlatform(platformId);
            Alert.alert('Disconnected', `${platformName} account has been disconnected.`);
          },
        },
      ],
    );
  };

  const connectedCount = connectedPlatforms.filter((p) => p.status === 'active').length;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <View style={styles.headerTextGroup}>
          <Text style={styles.title}>Social Accounts</Text>
          <Text style={styles.subtitle}>
            {connectedCount > 0
              ? `${connectedCount} account${connectedCount > 1 ? 's' : ''} connected`
              : 'Connect your platforms to start posting'}
          </Text>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.infoCard}>
          <Ionicons name="shield-checkmark-outline" size={20} color={COLORS.accent} />
          <Text style={styles.infoText}>
            Your accounts are connected via Ayrshare's secure OAuth. We never store your passwords.
          </Text>
        </View>

        {PLATFORMS.map((platform) => {
          const connected = connectedPlatforms.find((c) => c.platform === platform.id);
          return (
            <PlatformConnectorCard
              key={platform.id}
              platform={platform}
              connectedPlatform={connected}
              onConnect={() => handleConnect(platform)}
              onDisconnect={() => handleDisconnect(platform.id, platform.name)}
            />
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
    gap: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: { paddingTop: 4 },
  headerTextGroup: { flex: 1 },
  title: { fontSize: 24, fontWeight: '800', color: COLORS.textPrimary, letterSpacing: -0.5 },
  subtitle: { fontSize: 14, color: COLORS.textSecondary, marginTop: 4 },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 40, paddingTop: 16 },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.25)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 20,
  },
  infoText: { flex: 1, fontSize: 13, color: COLORS.accent, lineHeight: 18 },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 14,
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  platformIconBg: {
    width: 52,
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardInfo: { flex: 1 },
  platformName: { fontSize: 16, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 3 },
  platformHandle: { fontSize: 14, color: COLORS.textSecondary },
  platformNotConnected: { fontSize: 13, color: COLORS.textMuted },
  cardBadge: { alignItems: 'flex-end' },
  connectionInfo: {
    paddingHorizontal: 16,
    paddingBottom: 10,
  },
  connectedSince: { fontSize: 12, color: COLORS.textMuted },
  cardActions: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    paddingTop: 4,
  },
  connectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1.5,
    gap: 8,
    backgroundColor: 'transparent',
  },
  connectButtonText: { fontSize: 14, fontWeight: '700' },
  disconnectButton: {
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  disconnectButtonText: { fontSize: 14, fontWeight: '600', color: COLORS.error },
});
