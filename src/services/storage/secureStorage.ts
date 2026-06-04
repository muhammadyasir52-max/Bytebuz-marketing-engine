import * as SecureStore from 'expo-secure-store';

// ─── Keys ─────────────────────────────────────────────────────────────────────

const KEYS = {
  CLAUDE_API_KEY: 'claude_api_key',
  AYRSHARE_API_KEY: 'ayrshare_api_key',
  META_ACCESS_TOKEN: 'meta_access_token',
  META_AD_ACCOUNT_ID: 'meta_ad_account_id',
  META_PAGE_ID: 'meta_page_id',
} as const;

// SecureStore options — use after first unlock so it works in background
const SECURE_STORE_OPTIONS: SecureStore.SecureStoreOptions = {
  keychainAccessible: SecureStore.AFTER_FIRST_UNLOCK,
};

// ─── Claude API Key ───────────────────────────────────────────────────────────

/**
 * Saves the Claude API key to secure storage.
 * Encrypts the key on-device using platform keychain/keystore.
 */
export async function saveClaudeApiKey(key: string): Promise<void> {
  if (!key || key.trim().length === 0) {
    throw new Error('Cannot save empty Claude API key');
  }
  await SecureStore.setItemAsync(KEYS.CLAUDE_API_KEY, key.trim(), SECURE_STORE_OPTIONS);
}

/**
 * Retrieves the Claude API key from secure storage.
 * Returns null if not set.
 */
export async function getClaudeApiKey(): Promise<string | null> {
  return SecureStore.getItemAsync(KEYS.CLAUDE_API_KEY, SECURE_STORE_OPTIONS);
}

/**
 * Deletes the Claude API key from secure storage.
 */
export async function deleteClaudeApiKey(): Promise<void> {
  await SecureStore.deleteItemAsync(KEYS.CLAUDE_API_KEY, SECURE_STORE_OPTIONS);
}

// ─── Ayrshare API Key ─────────────────────────────────────────────────────────

/**
 * Saves the Ayrshare API key to secure storage.
 */
export async function saveAyrshareApiKey(key: string): Promise<void> {
  if (!key || key.trim().length === 0) {
    throw new Error('Cannot save empty Ayrshare API key');
  }
  await SecureStore.setItemAsync(KEYS.AYRSHARE_API_KEY, key.trim(), SECURE_STORE_OPTIONS);
}

/**
 * Retrieves the Ayrshare API key from secure storage.
 * Returns null if not set.
 */
export async function getAyrshareApiKey(): Promise<string | null> {
  return SecureStore.getItemAsync(KEYS.AYRSHARE_API_KEY, SECURE_STORE_OPTIONS);
}

/**
 * Deletes the Ayrshare API key from secure storage.
 */
export async function deleteAyrshareApiKey(): Promise<void> {
  await SecureStore.deleteItemAsync(KEYS.AYRSHARE_API_KEY, SECURE_STORE_OPTIONS);
}

// ─── Meta Access Token ────────────────────────────────────────────────────────

export async function saveMetaAccessToken(token: string): Promise<void> {
  if (!token?.trim()) throw new Error('Cannot save empty Meta access token');
  await SecureStore.setItemAsync(KEYS.META_ACCESS_TOKEN, token.trim(), SECURE_STORE_OPTIONS);
}
export async function getMetaAccessToken(): Promise<string | null> {
  return SecureStore.getItemAsync(KEYS.META_ACCESS_TOKEN, SECURE_STORE_OPTIONS);
}
export async function deleteMetaAccessToken(): Promise<void> {
  await SecureStore.deleteItemAsync(KEYS.META_ACCESS_TOKEN, SECURE_STORE_OPTIONS);
}

// ─── Meta Ad Account ID ───────────────────────────────────────────────────────

export async function saveMetaAdAccountId(id: string): Promise<void> {
  if (!id?.trim()) throw new Error('Cannot save empty Meta Ad Account ID');
  await SecureStore.setItemAsync(KEYS.META_AD_ACCOUNT_ID, id.trim(), SECURE_STORE_OPTIONS);
}
export async function getMetaAdAccountId(): Promise<string | null> {
  return SecureStore.getItemAsync(KEYS.META_AD_ACCOUNT_ID, SECURE_STORE_OPTIONS);
}
export async function deleteMetaAdAccountId(): Promise<void> {
  await SecureStore.deleteItemAsync(KEYS.META_AD_ACCOUNT_ID, SECURE_STORE_OPTIONS);
}

// ─── Meta Page ID ─────────────────────────────────────────────────────────────

export async function saveMetaPageId(id: string): Promise<void> {
  if (!id?.trim()) throw new Error('Cannot save empty Meta Page ID');
  await SecureStore.setItemAsync(KEYS.META_PAGE_ID, id.trim(), SECURE_STORE_OPTIONS);
}
export async function getMetaPageId(): Promise<string | null> {
  return SecureStore.getItemAsync(KEYS.META_PAGE_ID, SECURE_STORE_OPTIONS);
}
export async function deleteMetaPageId(): Promise<void> {
  await SecureStore.deleteItemAsync(KEYS.META_PAGE_ID, SECURE_STORE_OPTIONS);
}

// ─── Bulk Operations ──────────────────────────────────────────────────────────

/**
 * Clears ALL keys from secure storage.
 * Use on logout or account reset.
 */
export async function clearAllSecureStorage(): Promise<void> {
  await Promise.allSettled([
    SecureStore.deleteItemAsync(KEYS.CLAUDE_API_KEY, SECURE_STORE_OPTIONS),
    SecureStore.deleteItemAsync(KEYS.AYRSHARE_API_KEY, SECURE_STORE_OPTIONS),
    SecureStore.deleteItemAsync(KEYS.META_ACCESS_TOKEN, SECURE_STORE_OPTIONS),
    SecureStore.deleteItemAsync(KEYS.META_AD_ACCOUNT_ID, SECURE_STORE_OPTIONS),
    SecureStore.deleteItemAsync(KEYS.META_PAGE_ID, SECURE_STORE_OPTIONS),
  ]);
}

/**
 * Checks if a key is available in SecureStore (platform-level availability check).
 * Returns true if SecureStore is available on this device.
 */
export async function isSecureStorageAvailable(): Promise<boolean> {
  return SecureStore.isAvailableAsync();
}
