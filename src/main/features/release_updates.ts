import { app, session, shell } from 'electron';
import { compareVersions, normalizeSemver } from '../util/app-version-compat';

const RELEASE_API = 'https://api.github.com/repos/davoxpa/Orkas/releases/latest';
const RELEASES_URL = 'https://github.com/davoxpa/Orkas/releases';

export type ReleaseUpdate = {
  current: string;
  latest: string | null;
  available: boolean;
  releaseUrl: string | null;
  status: 'current' | 'available' | 'no_release' | 'unavailable';
};

export function releaseUpdateFromPayload(
  current: string,
  payload: unknown,
): ReleaseUpdate {
  const row = payload && typeof payload === 'object' ? payload as Record<string, unknown> : {};
  const latest = normalizeSemver(row.tag_name);
  const url = typeof row.html_url === 'string' && /^https:\/\/github\.com\/davoxpa\/Orkas\/releases\/tag\/[^/?#]+$/.test(row.html_url)
    ? row.html_url : null;
  if (!latest || !url || row.draft === true || row.prerelease === true) {
    return { current, latest: null, available: false, releaseUrl: null, status: 'unavailable' };
  }
  const newer = compareVersions(latest, current) === 1;
  return {
    current,
    latest,
    available: newer,
    releaseUrl: url,
    status: newer ? 'available' : 'current',
  };
}

export async function checkReleaseUpdate(): Promise<ReleaseUpdate> {
  const current = app.getVersion();
  const empty = (status: ReleaseUpdate['status']): ReleaseUpdate => ({
    current, latest: null, available: false, releaseUrl: null, status,
  });
  try {
    const response = await session.defaultSession.fetch(RELEASE_API, {
      headers: { Accept: 'application/vnd.github+json' },
      signal: AbortSignal.timeout(8_000),
    });
    if (response.status === 404) return empty('no_release');
    if (!response.ok) return empty('unavailable');
    const raw = await response.text();
    if (raw.length > 1_000_000) return empty('unavailable');
    return releaseUpdateFromPayload(current, JSON.parse(raw));
  } catch {
    return empty('unavailable');
  }
}

export async function openReleasePage(): Promise<void> {
  await shell.openExternal(RELEASES_URL);
}
