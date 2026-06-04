import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Alert,
  Modal,
  TextInput,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useMetaAdsStore } from '@/store/useMetaAdsStore';
import { useMetaAds } from '@/hooks/useMetaAds';
import CampaignCard from '@/components/ads/CampaignCard';
import AdCopyCard from '@/components/ads/AdCopyCard';
import {
  MetaCampaignObjective,
  MetaAdCopyVariant,
  MetaAdCTAType,
} from '@/types';
import { CreateCampaignParams } from '@/services/metaAds/metaAdsService';
import {
  isValidAccessToken,
  isValidAdAccountId,
  sanitiseNumericId,
  validateDailyBudget,
} from '@/utils/security';

// ─── Constants ────────────────────────────────────────────────────────────────

const COLORS = {
  background: '#0A0A1A',
  surface: '#141428',
  card: '#1C1C35',
  border: '#2A2A45',
  primary: '#7C3AED',
  accent: '#10B981',
  error: '#EF4444',
  warning: '#F59E0B',
  metaBlue: '#1877F2',
  textPrimary: '#FFFFFF',
  textSecondary: '#A0A0C0',
  textMuted: '#606080',
};

const OBJECTIVES: { value: MetaCampaignObjective; label: string; icon: string; desc: string }[] = [
  { value: 'OUTCOME_AWARENESS', label: 'Awareness', icon: 'eye-outline', desc: 'Maximize brand reach' },
  { value: 'OUTCOME_ENGAGEMENT', label: 'Engagement', icon: 'heart-outline', desc: 'Drive interactions' },
  { value: 'OUTCOME_LEADS', label: 'Lead Gen', icon: 'person-add-outline', desc: 'Capture leads' },
  { value: 'OUTCOME_SALES', label: 'Sales', icon: 'cart-outline', desc: 'Drive conversions' },
  { value: 'OUTCOME_TRAFFIC', label: 'Traffic', icon: 'globe-outline', desc: 'Website clicks' },
  { value: 'OUTCOME_APP_PROMOTION', label: 'App', icon: 'phone-portrait-outline', desc: 'App installs' },
];

type ActiveTab = 'campaigns' | 'adcopy' | 'insights';

// ─── Stat Card ────────────────────────────────────────────────────────────────

function AccountStatCard({ icon, value, label, color }: {
  icon: string; value: string; label: string; color?: string;
}) {
  return (
    <View style={styles.statCard}>
      <Ionicons name={icon as any} size={18} color={color ?? COLORS.textMuted} />
      <Text style={[styles.statValue, color ? { color } : {}]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

// ─── Connect Sheet ────────────────────────────────────────────────────────────

function ConnectSheet({ visible, onClose, onConnect }: {
  visible: boolean;
  onClose: () => void;
  onConnect: (token: string, accountId: string, pageId: string) => void;
}) {
  const [token, setToken] = useState('');
  const [accountId, setAccountId] = useState('');
  const [pageId, setPageId] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleConnect = async () => {
    if (!token.trim() || !accountId.trim()) {
      Alert.alert('Required Fields', 'Access token and Ad Account ID are required.');
      return;
    }
    if (!isValidAccessToken(token.trim())) {
      Alert.alert('Invalid Token', 'Access token appears invalid. It should be at least 20 characters with no spaces.');
      return;
    }
    const cleanAccountId = sanitiseNumericId(accountId.trim());
    if (!isValidAdAccountId(cleanAccountId)) {
      Alert.alert('Invalid Account ID', 'Ad Account ID must be 8-20 digits.');
      return;
    }
    const cleanPageId = pageId.trim() ? sanitiseNumericId(pageId.trim()) : '';
    setSubmitting(true);
    try {
      await onConnect(token.trim(), cleanAccountId, cleanPageId);
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={onClose} activeOpacity={0.75}>
            <Ionicons name="close" size={24} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.modalTitle}>Connect Meta Ads</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false}>
          {/* Meta branding */}
          <View style={styles.metaBrand}>
            <View style={[styles.metaIcon, { backgroundColor: COLORS.metaBlue }]}>
              <Ionicons name="logo-facebook" size={32} color={COLORS.textPrimary} />
            </View>
            <Text style={styles.metaBrandTitle}>Meta Business Suite</Text>
            <Text style={styles.metaBrandSubtitle}>
              Connect your Meta Ads account to manage campaigns, run ads, and track performance.
            </Text>
          </View>

          {/* Instructions */}
          <View style={styles.instructionBox}>
            <Text style={styles.instructionTitle}>How to get your credentials</Text>
            <View style={styles.instructionStep}>
              <View style={styles.stepNum}><Text style={styles.stepNumText}>1</Text></View>
              <Text style={styles.stepText}>Go to Meta Business Suite → Settings → System Users</Text>
            </View>
            <View style={styles.instructionStep}>
              <View style={styles.stepNum}><Text style={styles.stepNumText}>2</Text></View>
              <Text style={styles.stepText}>Create a System User with ads_management permission</Text>
            </View>
            <View style={styles.instructionStep}>
              <View style={styles.stepNum}><Text style={styles.stepNumText}>3</Text></View>
              <Text style={styles.stepText}>Generate a long-lived access token and copy it below</Text>
            </View>
            <View style={styles.instructionStep}>
              <View style={styles.stepNum}><Text style={styles.stepNumText}>4</Text></View>
              <Text style={styles.stepText}>Your Ad Account ID is on your Ads Manager dashboard (format: 1234567890)</Text>
            </View>
          </View>

          {/* Form */}
          <Text style={styles.fieldLabel}>Access Token *</Text>
          <TextInput
            style={styles.textInput}
            value={token}
            onChangeText={setToken}
            placeholder="EAABwzLixnjYBO..."
            placeholderTextColor={COLORS.textMuted}
            autoCapitalize="none"
            autoCorrect={false}
            secureTextEntry
            maxLength={600}
          />

          <Text style={styles.fieldLabel}>Ad Account ID *</Text>
          <TextInput
            style={styles.textInput}
            value={accountId}
            onChangeText={(v) => setAccountId(v.replace(/\D/g, '').slice(0, 20))}
            placeholder="1234567890"
            placeholderTextColor={COLORS.textMuted}
            keyboardType="numeric"
            maxLength={20}
          />

          <Text style={styles.fieldLabel}>Facebook Page ID (optional)</Text>
          <TextInput
            style={styles.textInput}
            value={pageId}
            onChangeText={(v) => setPageId(v.replace(/\D/g, '').slice(0, 20))}
            placeholder="Required to create ad creatives"
            placeholderTextColor={COLORS.textMuted}
            keyboardType="numeric"
            maxLength={20}
          />

          <View style={styles.securityNote}>
            <Ionicons name="lock-closed-outline" size={14} color={COLORS.accent} />
            <Text style={styles.securityText}>
              Credentials are stored securely on-device using platform encryption. Never transmitted to third parties.
            </Text>
          </View>
        </ScrollView>

        <TouchableOpacity
          style={[styles.connectBtn, submitting && { opacity: 0.7 }]}
          onPress={handleConnect}
          activeOpacity={0.85}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator color={COLORS.textPrimary} />
          ) : (
            <>
              <Ionicons name="link-outline" size={18} color={COLORS.textPrimary} />
              <Text style={styles.connectBtnText}>Connect Meta Ads</Text>
            </>
          )}
        </TouchableOpacity>
      </SafeAreaView>
    </Modal>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function AdsManagerScreen() {
  const {
    isConnected, adAccount, campaigns, accountInsights,
    generatedCopies, isLoading, isSyncing, lastSyncedAt, error: storeError,
  } = useMetaAdsStore();

  const {
    isWorking, error, clearError, connect, disconnect, syncAccount,
    fetchCampaigns, createCampaign, pauseCampaign, resumeCampaign,
    deleteCampaign, fetchCampaignInsights, generateAdCopy, analyzeCampaignPerformance,
  } = useMetaAds();

  const [activeTab, setActiveTab] = useState<ActiveTab>('campaigns');
  const [showConnect, setShowConnect] = useState(false);
  const [showNewCampaign, setShowNewCampaign] = useState(false);
  const [showAdCopyGen, setShowAdCopyGen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [analysisText, setAnalysisText] = useState<string | null>(null);
  const [analysisLoading, setAnalysisLoading] = useState(false);

  // New campaign form
  const [campaignName, setCampaignName] = useState('');
  const [campaignObjective, setCampaignObjective] = useState<MetaCampaignObjective>('OUTCOME_TRAFFIC');
  const [dailyBudgetStr, setDailyBudgetStr] = useState('10');

  // Ad copy form
  const [adProduct, setAdProduct] = useState('');
  const [adAudience, setAdAudience] = useState('');
  const [isGeneratingCopy, setIsGeneratingCopy] = useState(false);

  useEffect(() => {
    if (isConnected) {
      syncAccount();
    }
  }, [isConnected]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    if (isConnected) await syncAccount();
    setRefreshing(false);
  }, [isConnected, syncAccount]);

  const handleConnect = async (token: string, accountId: string, pageId: string) => {
    const ok = await connect(token, accountId, pageId || undefined);
    if (!ok) Alert.alert('Connection Failed', error ?? 'Check your credentials and try again.');
  };

  const handleCreateCampaign = async () => {
    if (!campaignName.trim()) {
      Alert.alert('Name Required', 'Enter a campaign name.');
      return;
    }
    const budgetValidation = validateDailyBudget(dailyBudgetStr || '0');
    if (!budgetValidation.valid) {
      Alert.alert('Invalid Budget', budgetValidation.error ?? 'Enter a valid daily budget.');
      return;
    }
    const params: CreateCampaignParams = {
      name: campaignName.trim().slice(0, 200),
      objective: campaignObjective,
      dailyBudget: budgetValidation.cents,
      status: 'PAUSED',
    };
    const campaign = await createCampaign(params);
    if (campaign) {
      setShowNewCampaign(false);
      setCampaignName('');
      setDailyBudgetStr('10');
      Alert.alert('Campaign Created', `"${campaign.name}" created as Paused. Activate it when ready.`);
    }
  };

  const handleGenerateCopy = async () => {
    if (!adProduct.trim()) {
      Alert.alert('Product Required', 'Describe the product or offer you are advertising.');
      return;
    }
    setIsGeneratingCopy(true);
    await generateAdCopy({
      campaignObjective,
      targetAudience: adAudience || 'general audience',
      product: adProduct,
      numVariants: 3,
    });
    setIsGeneratingCopy(false);
    setShowAdCopyGen(false);
    setActiveTab('adcopy');
  };

  const handleAnalyzeCampaign = async (campaignId: string) => {
    // Ensure insights are fetched first
    await fetchCampaignInsights(campaignId, 'last_7d');
    setAnalysisLoading(true);
    const text = await analyzeCampaignPerformance(campaignId);
    setAnalysisText(text);
    setAnalysisLoading(false);
    if (text) {
      Alert.alert('AI Analysis', text);
    } else {
      Alert.alert('Error', 'Could not analyze campaign. Make sure insights are available.');
    }
  };

  const handleDelete = (campaignId: string, name: string) => {
    Alert.alert('Delete Campaign', `Delete "${name}"? This cannot be undone.`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteCampaign(campaignId) },
    ]);
  };

  const currency = adAccount?.currency ?? 'USD';

  // ─── Not Connected ───────────────────────────────────────────────────────

  if (!isConnected) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
        <View style={styles.notConnected}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()} activeOpacity={0.75}>
            <Ionicons name="arrow-back" size={22} color={COLORS.textPrimary} />
          </TouchableOpacity>

          <View style={styles.notConnectedContent}>
            <View style={[styles.metaIcon, { backgroundColor: COLORS.metaBlue, width: 72, height: 72, borderRadius: 36 }]}>
              <Ionicons name="logo-facebook" size={40} color={COLORS.textPrimary} />
            </View>
            <Text style={styles.notConnectedTitle}>Meta Ads Manager</Text>
            <Text style={styles.notConnectedSubtitle}>
              Connect your Meta Ads account to create, manage, and optimize Facebook & Instagram ad campaigns — powered by Claude AI.
            </Text>

            <View style={styles.featureList}>
              {[
                ['Create & manage campaigns', 'briefcase-outline'],
                ['AI-generated ad copy variants', 'sparkles-outline'],
                ['Real-time performance insights', 'bar-chart-outline'],
                ['Smart audience suggestions', 'people-outline'],
                ['One-tap pause/resume/delete', 'toggle-outline'],
              ].map(([label, icon]) => (
                <View key={label} style={styles.featureItem}>
                  <Ionicons name={icon as any} size={16} color={COLORS.accent} />
                  <Text style={styles.featureText}>{label}</Text>
                </View>
              ))}
            </View>

            <TouchableOpacity
              style={styles.connectMainBtn}
              onPress={() => setShowConnect(true)}
              activeOpacity={0.85}
            >
              <Ionicons name="link-outline" size={20} color={COLORS.textPrimary} />
              <Text style={styles.connectMainBtnText}>Connect Meta Ads Account</Text>
            </TouchableOpacity>
          </View>
        </View>

        <ConnectSheet
          visible={showConnect}
          onClose={() => setShowConnect(false)}
          onConnect={handleConnect}
        />
      </SafeAreaView>
    );
  }

  // ─── Connected UI ────────────────────────────────────────────────────────

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing || isSyncing} onRefresh={onRefresh} tintColor={COLORS.primary} />
        }
      >
        {/* Header */}
        <View style={styles.pageHeader}>
          <TouchableOpacity onPress={() => router.back()} activeOpacity={0.75}>
            <Ionicons name="arrow-back" size={22} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <View style={styles.metaIndicator}>
              <Ionicons name="logo-facebook" size={14} color={COLORS.metaBlue} />
              <Text style={styles.metaIndicatorText}>{adAccount?.name ?? 'Meta Ads'}</Text>
            </View>
            <Text style={styles.pageTitle}>Ads Manager</Text>
          </View>
          <TouchableOpacity style={styles.disconnectBtn} onPress={() => {
            Alert.alert('Disconnect', 'Disconnect Meta Ads account?', [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Disconnect', style: 'destructive', onPress: disconnect },
            ]);
          }} activeOpacity={0.75}>
            <Ionicons name="log-out-outline" size={20} color={COLORS.textMuted} />
          </TouchableOpacity>
        </View>

        {/* Error */}
        {(error || storeError) && (
          <TouchableOpacity style={styles.errorBanner} onPress={clearError} activeOpacity={0.8}>
            <Ionicons name="alert-circle-outline" size={16} color={COLORS.error} />
            <Text style={styles.errorText} numberOfLines={2}>{error ?? storeError}</Text>
          </TouchableOpacity>
        )}

        {/* Account metrics */}
        {accountInsights && (
          <View style={styles.statsRow}>
            <AccountStatCard
              icon="wallet-outline"
              value={`${currency} ${accountInsights.spend.toFixed(0)}`}
              label="30-Day Spend"
              color={COLORS.warning}
            />
            <AccountStatCard
              icon="eye-outline"
              value={accountInsights.impressions >= 1000
                ? `${(accountInsights.impressions / 1000).toFixed(0)}K`
                : accountInsights.impressions.toString()}
              label="Impressions"
              color={COLORS.metaBlue}
            />
            <AccountStatCard
              icon="cursor-outline"
              value={`${accountInsights.ctr.toFixed(2)}%`}
              label="Avg CTR"
              color={COLORS.accent}
            />
            <AccountStatCard
              icon="trending-up-outline"
              value={accountInsights.cpc > 0 ? `${currency} ${accountInsights.cpc.toFixed(2)}` : '—'}
              label="Avg CPC"
            />
          </View>
        )}

        {/* Tabs */}
        <View style={styles.tabs}>
          {(['campaigns', 'adcopy', 'insights'] as ActiveTab[]).map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, activeTab === tab && styles.tabActive]}
              onPress={() => setActiveTab(tab)}
              activeOpacity={0.8}
            >
              <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
                {tab === 'campaigns' ? 'Campaigns' : tab === 'adcopy' ? 'AI Copy' : 'Insights'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* ── CAMPAIGNS TAB ── */}
        {activeTab === 'campaigns' && (
          <View style={styles.tabContent}>
            <View style={styles.actionRow}>
              <TouchableOpacity
                style={[styles.pill, styles.pillPrimary]}
                onPress={() => setShowNewCampaign(true)}
                activeOpacity={0.8}
              >
                <Ionicons name="add-circle-outline" size={15} color={COLORS.textPrimary} />
                <Text style={styles.pillPrimaryText}>New Campaign</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.pill}
                onPress={syncAccount}
                activeOpacity={0.8}
                disabled={isSyncing}
              >
                {isSyncing
                  ? <ActivityIndicator size={14} color={COLORS.primary} />
                  : <Ionicons name="sync-outline" size={15} color={COLORS.primary} />
                }
                <Text style={styles.pillText}>Sync</Text>
              </TouchableOpacity>
            </View>

            {isLoading ? (
              <ActivityIndicator color={COLORS.primary} style={styles.loader} />
            ) : campaigns.length === 0 ? (
              <View style={styles.empty}>
                <Ionicons name="megaphone-outline" size={44} color={COLORS.textMuted} />
                <Text style={styles.emptyTitle}>No campaigns yet</Text>
                <Text style={styles.emptySubtitle}>Create your first campaign to start advertising</Text>
              </View>
            ) : (
              campaigns.map((c) => (
                <CampaignCard
                  key={c.id}
                  campaign={c}
                  currency={currency}
                  onPress={() => fetchCampaignInsights(c.id, 'last_7d')}
                  onPause={() => pauseCampaign(c.id)}
                  onResume={() => resumeCampaign(c.id)}
                  onDelete={() => handleDelete(c.id, c.name)}
                  onAnalyze={() => handleAnalyzeCampaign(c.id)}
                />
              ))
            )}
          </View>
        )}

        {/* ── AI COPY TAB ── */}
        {activeTab === 'adcopy' && (
          <View style={styles.tabContent}>
            <TouchableOpacity
              style={[styles.pill, styles.pillPrimary, { alignSelf: 'flex-start' }]}
              onPress={() => setShowAdCopyGen(true)}
              activeOpacity={0.8}
            >
              <Ionicons name="sparkles-outline" size={15} color={COLORS.textPrimary} />
              <Text style={styles.pillPrimaryText}>Generate Ad Copy</Text>
            </TouchableOpacity>

            {isGeneratingCopy && (
              <View style={styles.generatingBanner}>
                <ActivityIndicator color={COLORS.primary} size="small" />
                <Text style={styles.generatingText}>Claude is writing your ad copy…</Text>
              </View>
            )}

            {generatedCopies.length === 0 && !isGeneratingCopy ? (
              <View style={styles.empty}>
                <Ionicons name="sparkles-outline" size={44} color={COLORS.textMuted} />
                <Text style={styles.emptyTitle}>No ad copy generated</Text>
                <Text style={styles.emptySubtitle}>Let Claude write high-converting ad variants for you</Text>
              </View>
            ) : (
              generatedCopies.map((copy, i) => (
                <AdCopyCard key={i} variant={copy} index={i} />
              ))
            )}
          </View>
        )}

        {/* ── INSIGHTS TAB ── */}
        {activeTab === 'insights' && (
          <View style={styles.tabContent}>
            {campaigns.length === 0 ? (
              <View style={styles.empty}>
                <Ionicons name="bar-chart-outline" size={44} color={COLORS.textMuted} />
                <Text style={styles.emptyTitle}>No data yet</Text>
                <Text style={styles.emptySubtitle}>Create campaigns and run ads to see insights</Text>
              </View>
            ) : (
              <>
                <Text style={styles.insightsLabel}>Campaign Performance (Last 7 Days)</Text>
                {campaigns.filter((c) => c.insights).map((c) => (
                  <View key={c.id} style={styles.insightRow}>
                    <View style={styles.insightLeft}>
                      <Text style={styles.insightName} numberOfLines={1}>{c.name}</Text>
                      <Text style={styles.insightStatus}>{c.status}</Text>
                    </View>
                    <View style={styles.insightMetrics}>
                      <Text style={styles.insightMetric}>
                        {currency} {c.insights?.spend.toFixed(2) ?? '0'}
                      </Text>
                      <Text style={styles.insightMetricLabel}>spend</Text>
                    </View>
                    <View style={styles.insightMetrics}>
                      <Text style={styles.insightMetric}>{c.insights?.ctr.toFixed(2) ?? '0'}%</Text>
                      <Text style={styles.insightMetricLabel}>CTR</Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => handleAnalyzeCampaign(c.id)}
                      style={styles.aiBtn}
                      activeOpacity={0.75}
                    >
                      <Ionicons name="sparkles-outline" size={14} color={COLORS.primary} />
                    </TouchableOpacity>
                  </View>
                ))}
              </>
            )}
          </View>
        )}
      </ScrollView>

      {/* ── NEW CAMPAIGN MODAL ── */}
      <Modal
        visible={showNewCampaign}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowNewCampaign(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>New Campaign</Text>
            <TouchableOpacity onPress={() => setShowNewCampaign(false)} activeOpacity={0.75}>
              <Ionicons name="close" size={24} color={COLORS.textPrimary} />
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false}>
            <Text style={styles.fieldLabel}>Campaign Name</Text>
            <TextInput
              style={styles.textInput}
              value={campaignName}
              onChangeText={setCampaignName}
              placeholder="e.g. Summer Sale 2024"
              placeholderTextColor={COLORS.textMuted}
              autoFocus
            />

            <Text style={styles.fieldLabel}>Objective</Text>
            <View style={styles.objectiveGrid}>
              {OBJECTIVES.map((obj) => (
                <TouchableOpacity
                  key={obj.value}
                  style={[styles.objectiveCard, campaignObjective === obj.value && styles.objectiveCardActive]}
                  onPress={() => setCampaignObjective(obj.value)}
                  activeOpacity={0.75}
                >
                  <Ionicons
                    name={obj.icon as any}
                    size={20}
                    color={campaignObjective === obj.value ? COLORS.primary : COLORS.textMuted}
                  />
                  <Text style={[styles.objectiveLabel, campaignObjective === obj.value && styles.objectiveLabelActive]}>
                    {obj.label}
                  </Text>
                  <Text style={styles.objectiveDesc}>{obj.desc}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.fieldLabel}>Daily Budget (USD)</Text>
            <TextInput
              style={styles.textInput}
              value={dailyBudgetStr}
              onChangeText={setDailyBudgetStr}
              placeholder="10.00"
              placeholderTextColor={COLORS.textMuted}
              keyboardType="decimal-pad"
            />
            <Text style={styles.fieldHint}>Campaign will start as Paused. Activate it when ready.</Text>
          </ScrollView>

          <TouchableOpacity
            style={[styles.connectBtn, isWorking && { opacity: 0.7 }]}
            onPress={handleCreateCampaign}
            activeOpacity={0.85}
            disabled={isWorking}
          >
            {isWorking
              ? <ActivityIndicator color={COLORS.textPrimary} />
              : <>
                  <Ionicons name="megaphone-outline" size={18} color={COLORS.textPrimary} />
                  <Text style={styles.connectBtnText}>Create Campaign</Text>
                </>
            }
          </TouchableOpacity>
        </SafeAreaView>
      </Modal>

      {/* ── AD COPY MODAL ── */}
      <Modal
        visible={showAdCopyGen}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowAdCopyGen(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Generate Ad Copy</Text>
            <TouchableOpacity onPress={() => setShowAdCopyGen(false)} activeOpacity={0.75}>
              <Ionicons name="close" size={24} color={COLORS.textPrimary} />
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false}>
            <View style={styles.claudeBadge}>
              <Ionicons name="sparkles-outline" size={14} color={COLORS.primary} />
              <Text style={styles.claudeBadgeText}>Powered by Claude AI</Text>
            </View>

            <Text style={styles.fieldLabel}>Product / Offer *</Text>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              value={adProduct}
              onChangeText={setAdProduct}
              placeholder="Describe what you're advertising. Be specific about the offer, price, or unique value."
              placeholderTextColor={COLORS.textMuted}
              multiline
              numberOfLines={3}
              autoFocus
            />

            <Text style={styles.fieldLabel}>Target Audience</Text>
            <TextInput
              style={styles.textInput}
              value={adAudience}
              onChangeText={setAdAudience}
              placeholder="e.g. Small business owners aged 30-50 in the US"
              placeholderTextColor={COLORS.textMuted}
            />

            <Text style={styles.fieldLabel}>Campaign Objective</Text>
            <View style={styles.objectiveGrid}>
              {OBJECTIVES.map((obj) => (
                <TouchableOpacity
                  key={obj.value}
                  style={[styles.objectiveCard, campaignObjective === obj.value && styles.objectiveCardActive]}
                  onPress={() => setCampaignObjective(obj.value)}
                  activeOpacity={0.75}
                >
                  <Ionicons
                    name={obj.icon as any}
                    size={18}
                    color={campaignObjective === obj.value ? COLORS.primary : COLORS.textMuted}
                  />
                  <Text style={[styles.objectiveLabel, campaignObjective === obj.value && styles.objectiveLabelActive]}>
                    {obj.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>

          <TouchableOpacity
            style={[styles.connectBtn, { backgroundColor: COLORS.primary }, isGeneratingCopy && { opacity: 0.7 }]}
            onPress={handleGenerateCopy}
            activeOpacity={0.85}
            disabled={isGeneratingCopy}
          >
            {isGeneratingCopy
              ? <ActivityIndicator color={COLORS.textPrimary} />
              : <>
                  <Ionicons name="sparkles-outline" size={18} color={COLORS.textPrimary} />
                  <Text style={styles.connectBtnText}>Generate 3 Variants</Text>
                </>
            }
          </TouchableOpacity>
        </SafeAreaView>
      </Modal>

      <ConnectSheet
        visible={showConnect}
        onClose={() => setShowConnect(false)}
        onConnect={handleConnect}
      />
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 80 },

  // Not connected
  notConnected: { flex: 1 },
  backBtn: { padding: 20, alignSelf: 'flex-start' },
  notConnectedContent: { flex: 1, alignItems: 'center', paddingHorizontal: 28, paddingTop: 16 },
  metaIcon: {
    width: 64, height: 64, borderRadius: 32,
    alignItems: 'center', justifyContent: 'center', marginBottom: 16,
  },
  notConnectedTitle: { fontSize: 26, fontWeight: '800', color: COLORS.textPrimary, marginBottom: 10, textAlign: 'center' },
  notConnectedSubtitle: { fontSize: 14, color: COLORS.textSecondary, textAlign: 'center', lineHeight: 20, marginBottom: 28 },
  featureList: { alignSelf: 'stretch', gap: 10, marginBottom: 32 },
  featureItem: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  featureText: { fontSize: 14, color: COLORS.textSecondary },
  connectMainBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: COLORS.metaBlue, borderRadius: 14,
    paddingVertical: 16, paddingHorizontal: 28, alignSelf: 'stretch', justifyContent: 'center',
  },
  connectMainBtnText: { fontSize: 16, fontWeight: '700', color: COLORS.textPrimary },

  // Header
  pageHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingTop: 14, paddingBottom: 12,
  },
  headerCenter: { alignItems: 'center' },
  metaIndicator: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: `${COLORS.metaBlue}22`, borderRadius: 20,
    paddingHorizontal: 10, paddingVertical: 3, marginBottom: 2,
  },
  metaIndicatorText: { fontSize: 11, color: COLORS.metaBlue, fontWeight: '600' },
  pageTitle: { fontSize: 20, fontWeight: '800', color: COLORS.textPrimary },
  disconnectBtn: { padding: 6 },

  // Error
  errorBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: `${COLORS.error}22`, borderWidth: 1, borderColor: COLORS.error,
    borderRadius: 12, padding: 12, marginHorizontal: 20, marginBottom: 12,
  },
  errorText: { flex: 1, fontSize: 13, color: COLORS.error },

  // Stats
  statsRow: { flexDirection: 'row', paddingHorizontal: 20, gap: 8, marginBottom: 18 },
  statCard: {
    flex: 1, backgroundColor: COLORS.card, borderRadius: 12, borderWidth: 1,
    borderColor: COLORS.border, alignItems: 'center', paddingVertical: 10, gap: 2,
  },
  statValue: { fontSize: 14, fontWeight: '800', color: COLORS.textPrimary },
  statLabel: { fontSize: 9, color: COLORS.textMuted, fontWeight: '600', textAlign: 'center' },

  // Tabs
  tabs: {
    flexDirection: 'row', marginHorizontal: 20, backgroundColor: COLORS.card,
    borderRadius: 12, padding: 4, marginBottom: 18, borderWidth: 1, borderColor: COLORS.border,
  },
  tab: { flex: 1, paddingVertical: 8, borderRadius: 10, alignItems: 'center' },
  tabActive: { backgroundColor: COLORS.metaBlue },
  tabText: { fontSize: 12, fontWeight: '600', color: COLORS.textMuted },
  tabTextActive: { color: COLORS.textPrimary },

  // Tab content
  tabContent: { paddingHorizontal: 20 },
  actionRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  pill: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    borderWidth: 1.5, borderColor: COLORS.primary, borderRadius: 20,
    paddingHorizontal: 14, paddingVertical: 8,
  },
  pillPrimary: { backgroundColor: COLORS.metaBlue, borderColor: COLORS.metaBlue },
  pillText: { fontSize: 13, fontWeight: '600', color: COLORS.primary },
  pillPrimaryText: { fontSize: 13, fontWeight: '700', color: COLORS.textPrimary },
  loader: { marginTop: 40 },
  empty: { alignItems: 'center', paddingVertical: 48, gap: 8 },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: COLORS.textSecondary },
  emptySubtitle: { fontSize: 13, color: COLORS.textMuted, textAlign: 'center', maxWidth: 260 },

  generatingBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: `${COLORS.primary}22`, borderRadius: 12,
    padding: 14, marginBottom: 14, borderWidth: 1, borderColor: `${COLORS.primary}40`,
  },
  generatingText: { fontSize: 13, color: COLORS.primary },

  insightsLabel: { fontSize: 13, fontWeight: '700', color: COLORS.textSecondary, marginBottom: 10 },
  insightRow: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.card,
    borderRadius: 12, borderWidth: 1, borderColor: COLORS.border,
    padding: 12, marginBottom: 8, gap: 10,
  },
  insightLeft: { flex: 1 },
  insightName: { fontSize: 13, fontWeight: '600', color: COLORS.textPrimary },
  insightStatus: { fontSize: 11, color: COLORS.textMuted },
  insightMetrics: { alignItems: 'center', minWidth: 50 },
  insightMetric: { fontSize: 13, fontWeight: '700', color: COLORS.textPrimary },
  insightMetricLabel: { fontSize: 10, color: COLORS.textMuted },
  aiBtn: { padding: 6 },

  // Modal
  modalContainer: { flex: 1, backgroundColor: COLORS.background },
  modalHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  modalTitle: { fontSize: 20, fontWeight: '800', color: COLORS.textPrimary },
  modalScroll: { flex: 1, paddingHorizontal: 20, paddingTop: 16 },
  metaBrand: { alignItems: 'center', paddingVertical: 24, gap: 6 },
  metaBrandTitle: { fontSize: 20, fontWeight: '800', color: COLORS.textPrimary },
  metaBrandSubtitle: { fontSize: 13, color: COLORS.textSecondary, textAlign: 'center', lineHeight: 18 },
  instructionBox: {
    backgroundColor: COLORS.card, borderRadius: 14, padding: 14,
    borderWidth: 1, borderColor: COLORS.border, marginBottom: 16,
  },
  instructionTitle: { fontSize: 13, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 10 },
  instructionStep: { flexDirection: 'row', gap: 10, marginBottom: 8, alignItems: 'flex-start' },
  stepNum: {
    width: 20, height: 20, borderRadius: 10, backgroundColor: COLORS.metaBlue,
    alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1,
  },
  stepNumText: { fontSize: 11, fontWeight: '800', color: COLORS.textPrimary },
  stepText: { flex: 1, fontSize: 12, color: COLORS.textSecondary, lineHeight: 17 },
  fieldLabel: { fontSize: 13, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 8, marginTop: 14 },
  fieldHint: { fontSize: 12, color: COLORS.textMuted, marginTop: 4 },
  textInput: {
    backgroundColor: COLORS.card, borderWidth: 1, borderColor: COLORS.border,
    borderRadius: 12, padding: 14, color: COLORS.textPrimary, fontSize: 14,
  },
  textArea: { minHeight: 80, textAlignVertical: 'top' },
  securityNote: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 8,
    backgroundColor: `${COLORS.accent}15`, borderRadius: 10, padding: 12,
    borderWidth: 1, borderColor: `${COLORS.accent}30`, marginTop: 14,
  },
  securityText: { flex: 1, fontSize: 12, color: COLORS.textSecondary, lineHeight: 16 },
  objectiveGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  objectiveCard: {
    width: '30.5%', backgroundColor: COLORS.card, borderRadius: 12,
    borderWidth: 1, borderColor: COLORS.border, padding: 10, alignItems: 'center', gap: 4,
  },
  objectiveCardActive: { borderColor: COLORS.primary, backgroundColor: `${COLORS.primary}22` },
  objectiveLabel: { fontSize: 11, fontWeight: '700', color: COLORS.textSecondary, textAlign: 'center' },
  objectiveLabelActive: { color: COLORS.primary },
  objectiveDesc: { fontSize: 9, color: COLORS.textMuted, textAlign: 'center' },
  claudeBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: `${COLORS.primary}22`, borderRadius: 20,
    paddingHorizontal: 12, paddingVertical: 5, alignSelf: 'flex-start', marginBottom: 4,
    borderWidth: 1, borderColor: `${COLORS.primary}40`,
  },
  claudeBadgeText: { fontSize: 12, fontWeight: '600', color: COLORS.primary },
  connectBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: COLORS.metaBlue, margin: 20, borderRadius: 14, paddingVertical: 16,
  },
  connectBtnText: { fontSize: 16, fontWeight: '700', color: COLORS.textPrimary },
});
