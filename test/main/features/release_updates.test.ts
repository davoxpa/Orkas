import { describe, expect, it, vi } from 'vitest';

vi.mock('electron', () => ({ app: {}, session: {}, shell: {} }));

import { releaseUpdateFromPayload } from '../../../src/main/features/release_updates';

const release = {
  tag_name: 'v2026.11.9',
  html_url: 'https://github.com/davoxpa/Orkas/releases/tag/v2026.11.9',
  draft: false,
  prerelease: false,
};

describe('Talia release comparison', () => {
  it('shows a newer published release for source and packaged builds', () => {
    expect(releaseUpdateFromPayload('2026.11.4', release)).toMatchObject({
      latest: '2026.11.9', available: true, status: 'available',
    });
    expect(releaseUpdateFromPayload('2026.11.9', release)).toMatchObject({
      available: false, status: 'current',
    });
  });

  it('rejects malformed, unpublished, and foreign release URLs', () => {
    expect(releaseUpdateFromPayload('2026.11.4', { ...release, draft: true }).status).toBe('unavailable');
    expect(releaseUpdateFromPayload('2026.11.4', { ...release, prerelease: true }).status).toBe('unavailable');
    expect(releaseUpdateFromPayload('2026.11.4', { ...release, html_url: 'https://example.com/' }).status).toBe('unavailable');
    expect(releaseUpdateFromPayload('2026.11.4', { ...release, tag_name: 'latest' }).status).toBe('unavailable');
  });
});
