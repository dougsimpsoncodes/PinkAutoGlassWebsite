'use client';

import React from 'react';
import { createRoot, type Root } from 'react-dom/client';
import SatelliteQuoterShell from '@/components/satellite/SatelliteQuoterShell';
import type { SatelliteQuoterConfig } from '@/lib/satellite-quoter/config';

interface MountedEmbed {
  root: Root;
  mountNode: HTMLDivElement;
}

const mountedRoots = new WeakMap<Element, MountedEmbed>();
const EMBED_VERSION = '1.0.0';
const STYLE_LINK_ID = 'pag-satellite-quoter-styles';
const MOUNT_NODE_ATTR = 'data-pag-satellite-quoter-root';

const EMBED_ASSET_BASE = (() => {
  if (typeof document === 'undefined') return '';
  const currentScript = document.currentScript;
  if (currentScript instanceof HTMLScriptElement && currentScript.src) {
    return new URL('.', currentScript.src).toString();
  }
  return '';
})();

export interface SatelliteQuoterMountApi {
  version: string;
  mount: (target: string | Element, config: SatelliteQuoterConfig) => boolean;
  unmount: (target: string | Element) => void;
}

function resolveTarget(target: string | Element): Element | null {
  if (typeof document === 'undefined') return null;
  if (typeof target === 'string') return document.querySelector(target);
  return target;
}

function validateConfig(config: SatelliteQuoterConfig): void {
  if (!config || typeof config !== 'object') {
    throw new Error('Satellite quoter config is required.');
  }

  if (!config.siteKey || typeof config.siteKey !== 'string') {
    throw new Error('Satellite quoter config requires a string siteKey.');
  }

  if (config.mode !== 'standard' && config.mode !== 'zip-first') {
    throw new Error("Satellite quoter config mode must be 'standard' or 'zip-first'.");
  }
}

function reportMountError(message: string, error?: unknown): false {
  console.error(`[PAGSatelliteQuoter] ${message}`, error);
  return false;
}

function getAssetUrl(filename: string): string {
  if (EMBED_ASSET_BASE) return new URL(filename, EMBED_ASSET_BASE).toString();
  return `/embed/${filename}`;
}

function ensureShadowMount(target: Element): HTMLDivElement {
  const host = target as HTMLElement;
  const shadowRoot = host.shadowRoot ?? host.attachShadow({ mode: 'open' });

  let styleLink = shadowRoot.getElementById(STYLE_LINK_ID) as HTMLLinkElement | null;
  if (!styleLink) {
    styleLink = document.createElement('link');
    styleLink.id = STYLE_LINK_ID;
    styleLink.rel = 'stylesheet';
    styleLink.href = getAssetUrl('satellite-quoter.v1.css');
    shadowRoot.appendChild(styleLink);
  }

  let mountNode = shadowRoot.querySelector(`[${MOUNT_NODE_ATTR}]`) as HTMLDivElement | null;
  if (!mountNode) {
    mountNode = document.createElement('div');
    mountNode.setAttribute(MOUNT_NODE_ATTR, 'true');
    mountNode.className = 'pag-satellite-quoter-root';
    shadowRoot.appendChild(mountNode);
  }

  return mountNode;
}

function mount(target: string | Element, config: SatelliteQuoterConfig): boolean {
  const element = resolveTarget(target);
  if (!element) return reportMountError('Satellite quoter mount target was not found.');

  try {
    validateConfig(config);
  } catch (error) {
    return reportMountError('Satellite quoter config validation failed.', error);
  }

  let mounted = mountedRoots.get(element);
  if (!mounted) {
    const mountNode = ensureShadowMount(element);
    mounted = {
      root: createRoot(mountNode),
      mountNode,
    };
    mountedRoots.set(element, mounted);
  }

  mounted.root.render(
    <React.StrictMode>
      <SatelliteQuoterShell config={config} />
    </React.StrictMode>
  );

  return true;
}

function unmount(target: string | Element): void {
  const element = resolveTarget(target);
  if (!element) return;

  const mounted = mountedRoots.get(element);
  if (!mounted) return;

  mounted.root.unmount();
  mountedRoots.delete(element);
}

export const PAGSatelliteQuoter: SatelliteQuoterMountApi = {
  version: EMBED_VERSION,
  mount,
  unmount,
};

declare global {
  interface Window {
    PAGSatelliteQuoter?: SatelliteQuoterMountApi;
    PAGSatelliteQuoterV1?: SatelliteQuoterMountApi;
  }
}

if (typeof window !== 'undefined') {
  window.PAGSatelliteQuoter = PAGSatelliteQuoter;
  window.PAGSatelliteQuoterV1 = PAGSatelliteQuoter;
}
