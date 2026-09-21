/**
 * DisplayAdapter interface
 *
 * Abstracts the physical display/output system.
 * The web implementation targets a browser window.
 * The future Tauri implementation will target OS-level display APIs.
 *
 * Never import a concrete DisplayAdapter in presentation components —
 * always access through the registered adapter instance.
 */

export interface DisplayOutput {
  id: string;
  name: string;
  /** Output type determines where rendered content is sent */
  type: 'congregation' | 'stage' | 'confidence' | 'livestream' | 'recording';
  width: number;
  height: number;
  isActive: boolean;
}

export interface DisplayAdapter {
  /**
   * Return all available display outputs.
   */
  getOutputs(): Promise<DisplayOutput[]>;

  /**
   * Open or activate a specific output.
   */
  activateOutput(outputId: string): Promise<void>;

  /**
   * Deactivate an output.
   */
  deactivateOutput(outputId: string): Promise<void>;

  /**
   * Send a rendered frame/content to a specific output.
   * The payload format is adapter-specific (e.g. a URL, HTML string, or frame buffer).
   */
  sendToOutput(outputId: string, payload: unknown): Promise<void>;
}
