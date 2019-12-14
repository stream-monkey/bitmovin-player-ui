import { Container, ContainerConfig } from './container';
import { Label } from './label';
import { UIInstanceManager } from '../uimanager';
import { Timeout } from '../timeout';
import { Event, EventDispatcher, NoArgs } from '../eventdispatcher';
import { PlayerAPI } from 'bitmovin-player';
import { Component, ComponentConfig } from './component';

/**
 * Configuration interface for a {@link SharePanel}.
 */
export interface SharePanelConfig extends ContainerConfig {
  /**
   * The delay in milliseconds after which the share panel will be hidden when there is no user interaction.
   * Set to -1 to disable automatic hiding.
   * Default: 3 seconds (3000)
   */
  hideDelay?: number;
}

/**
 * A panel containing a list of {@link SharePanelPage items}.
 *
 * To configure pages just pass them in the components array.
 *
 * Example:
 *  let settingsPanel = new SharePanel({
 *    hidden: true,
 *  });
 *
 *  let settingsPanelPage = new SharePanelPage({
 *    components: […]
 *  });
 *
 *  let secondSharePanelPage = new SharePanelPage({
 *    components: […]
 *  });
 *
 *  settingsPanel.addComponent(settingsPanelPage);
 *  settingsPanel.addComponent(secondSharePanelPage);
 *
 * For an example how to navigate between pages @see SharePanelPageNavigatorButton
 */
export class SharePanel extends Container<SharePanelConfig> {

  private hideTimeout: Timeout;

  constructor(config: SharePanelConfig = {}) {
    super(config);

    this.config = this.mergeConfig(config, {
      cssClasses: ['ui-settings-panel', 'ui-share-panel'],
      hidden: true,
      hideDelay: 3000,
      pageTransitionAnimation: true,
      components: [
        new Label({ text: 'twittah' }),
      ]
    } as SharePanelConfig, this.config);
  }

  configure(player: PlayerAPI, uimanager: UIInstanceManager): void {
    super.configure(player, uimanager);

    let config = this.getConfig();

    if (config.hideDelay > -1) {
      this.hideTimeout = new Timeout(config.hideDelay, () => {
        this.hide();
      });

      this.onShow.subscribe(() => {
        // Activate timeout when shown
        this.hideTimeout.start();
      });
      this.getDomElement().on('mouseenter', () => {
        // On mouse enter clear the timeout
        this.hideTimeout.clear();
      });
      this.getDomElement().on('mouseleave', () => {
        // On mouse leave activate the timeout
        this.hideTimeout.reset();
      });
      this.onHide.subscribe(() => {
        // Clear timeout when hidden from outside
        this.hideTimeout.clear();
      });
    }
  }
}
