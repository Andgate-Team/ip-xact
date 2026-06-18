import type { ComponentType } from "../../types";

const icons: Record<ComponentType, string> = {
  cpu: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="currentColor"><rect x="4" y="4" width="12" height="12" rx="2" fill="none" stroke="currentColor" stroke-width="1.5"/><rect x="7" y="7" width="6" height="6" rx="1"/></svg>`,
  bus: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="currentColor"><line x1="3" y1="6" x2="17" y2="6" stroke="currentColor" stroke-width="2"/><line x1="3" y1="10" x2="17" y2="10" stroke="currentColor" stroke-width="2"/><line x1="3" y1="14" x2="17" y2="14" stroke="currentColor" stroke-width="2"/></svg>`,
  memory: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="currentColor"><rect x="3" y="3" width="14" height="14" rx="2" fill="none" stroke="currentColor" stroke-width="1.5"/><line x1="3" y1="8" x2="17" y2="8" stroke="currentColor" stroke-width="1.5"/><line x1="3" y1="13" x2="17" y2="13" stroke="currentColor" stroke-width="1.5"/></svg>`,
  peripheral: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="currentColor"><circle cx="10" cy="10" r="7" fill="none" stroke="currentColor" stroke-width="1.5"/><circle cx="10" cy="10" r="2" fill="currentColor"/></svg>`,
  interface: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="currentColor"><path d="M4 10h12M12 6l4 4-4 4" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  clockReset: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="currentColor"><circle cx="10" cy="10" r="7" fill="none" stroke="currentColor" stroke-width="1.5"/><line x1="10" y1="5" x2="10" y2="10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><line x1="10" y1="10" x2="14" y2="12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>`,
  custom: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="currentColor"><rect x="4" y="4" width="12" height="12" rx="2" fill="none" stroke="currentColor" stroke-width="1.5"/><text x="10" y="13" text-anchor="middle" font-size="8" font-weight="bold" fill="currentColor">?</text></svg>`,
  dma: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="currentColor"><rect x="3" y="6" width="14" height="8" rx="2" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M7 10l3-3 3 3" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  interruptController: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="currentColor"><circle cx="10" cy="10" r="7" fill="none" stroke="currentColor" stroke-width="1.5"/><text x="10" y="14" text-anchor="middle" font-size="10" font-weight="bold" fill="currentColor">!</text></svg>`,
  debug: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="currentColor"><rect x="3" y="3" width="14" height="14" rx="2" fill="none" stroke="currentColor" stroke-width="1.5"/><circle cx="7" cy="7" r="1.5" fill="currentColor"/><circle cx="13" cy="7" r="1.5" fill="currentColor"/><circle cx="7" cy="13" r="1.5" fill="currentColor"/><circle cx="13" cy="13" r="1.5" fill="currentColor"/></svg>`
};

export function getNodeIconDataUri(type: ComponentType): string {
  const svg = icons[type] ?? icons.custom;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}
