/**
 * Shared User-Agent identity for Pink Auto Glass outbound vendor traffic.
 *
 * Every vendor client (Mygrant, AutoBolt, future glass vendors) MUST send
 * this exact value on every request. The string is the integration identity
 * vendors use to filter our traffic in their logs and provide support.
 *
 * Do NOT bump the version on every app release. The version reflects a
 * deliberate contract change (new auth, new base URL, new identity), not the
 * deploy version. Changing it churns vendor log filters.
 *
 * See `.claude/CLAUDE.md` → "Mygrant API Integration — User-Agent Rule" for
 * the full policy. The same rule applies to AutoBolt and any future vendor.
 */
export const OMS_USER_AGENT = 'PinkAutoGlass-OMS/1.0 (+https://pinkautoglass.com; doug@pinkautoglass.com)';
