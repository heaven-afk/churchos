/**
 * BrowserDisplayAdapter — Web implementation of DisplayAdapter
 *
 * Manages the secondary presentation window (/presentation) in a browser environment.
 * In a future Tauri/desktop build, this is swapped for OS-level multi-window/display APIs.
 */

import type { DisplayAdapter, DisplayOutput } from './display.adapter';
import { broadcastPresentationState } from '@/lib/presentation/sync';
import type { SyncedPresentationState } from '@/lib/presentation/sync';

export class BrowserDisplayAdapter implements DisplayAdapter {
  private outputWindow: Window | null = null;

  async getOutputs(): Promise<DisplayOutput[]> {
    const isWindowActive =
      typeof window !== 'undefined' &&
      this.outputWindow !== null &&
      !this.outputWindow.closed;

    return [
      {
        id: 'congregation',
        name: 'Congregation Display',
        type: 'congregation',
        width: typeof window !== 'undefined' ? window.screen.width : 1920,
        height: typeof window !== 'undefined' ? window.screen.height : 1080,
        isActive: isWindowActive,
      },
    ];
  }

  async activateOutput(outputId: string): Promise<void> {
    if (typeof window === 'undefined') return;

    if (outputId === 'congregation') {
      if (this.outputWindow && !this.outputWindow.closed) {
        this.outputWindow.focus();
        return;
      }

      // Open new presentation output window
      const features = [
        'width=1280',
        'height=720',
        'menubar=no',
        'toolbar=no',
        'location=no',
        'status=no',
        'resizable=yes',
        'scrollbars=no',
      ].join(',');

      this.outputWindow = window.open('/presentation', 'veyrin-output-window', features);
    }
  }

  async deactivateOutput(outputId: string): Promise<void> {
    if (outputId === 'congregation' && this.outputWindow && !this.outputWindow.closed) {
      this.outputWindow.close();
      this.outputWindow = null;
    }
  }

  async sendToOutput(outputId: string, payload: unknown): Promise<void> {
    if (outputId === 'congregation' && payload && typeof payload === 'object') {
      broadcastPresentationState(payload as Omit<SyncedPresentationState, 'updatedAt'>);
    }
  }

  /**
   * Helper to inspect if presentation window is currently open.
   */
  isOutputOpen(outputId = 'congregation'): boolean {
    if (outputId === 'congregation') {
      return this.outputWindow !== null && !this.outputWindow.closed;
    }
    return false;
  }
}

/** Singleton instance of the BrowserDisplayAdapter */
export const displayAdapter = new BrowserDisplayAdapter();
