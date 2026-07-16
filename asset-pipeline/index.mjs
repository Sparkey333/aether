import * as mock from './providers/mock.mjs';
import * as stability from './providers/stability.mjs';
import * as leonardo from './providers/leonardo.mjs';
import * as runway from './providers/runway.mjs';
import * as luma from './providers/luma.mjs';
import * as higgsfield from './providers/higgsfield.mjs';
import * as kling from './providers/kling.mjs';
import * as pika from './providers/pika.mjs';

export const PROVIDERS = {
  mock: { module: mock, kinds: ['image'], confidence: 'always available — placeholder tile, not real generative art' },
  stability: { module: stability, kinds: ['image'], confidence: 'high — stable public REST API' },
  leonardo: { module: leonardo, kinds: ['image'], confidence: 'high — stable public REST API' },
  runway: { module: runway, kinds: ['video'], confidence: 'high — image-to-video only, needs a source image URL' },
  luma: { module: luma, kinds: ['video'], confidence: 'high — text-to-video' },
  higgsfield: { module: higgsfield, kinds: ['image', 'video'], confidence: 'low — confirm endpoint against current docs before relying on it' },
  kling: { module: kling, kinds: ['video'], confidence: 'low — official API is region-gated; usually reached via a reseller' },
  pika: { module: pika, kinds: ['video'], confidence: 'low — confirm endpoint against current docs before relying on it' },
};

export async function generate(providerName, kind, args) {
  const entry = PROVIDERS[providerName];
  if (!entry) throw new Error(`Unknown provider "${providerName}". Known: ${Object.keys(PROVIDERS).join(', ')}`);
  const fn = kind === 'video' ? entry.module.generateVideo : entry.module.generateImage;
  if (!fn) throw new Error(`Provider "${providerName}" has no generate${kind === 'video' ? 'Video' : 'Image'} implementation.`);
  return fn(args);
}
