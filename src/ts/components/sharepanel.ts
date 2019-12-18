import { Container, ContainerConfig } from './container';
import { Label } from './label';
import { MetadataLabel, MetadataLabelContent } from './metadatalabel';
import { UIInstanceManager } from '../uimanager';
import { Timeout } from '../timeout';
import { Event, EventDispatcher, NoArgs } from '../eventdispatcher';
import { PlayerAPI } from 'bitmovin-player';
import { Component, ComponentConfig } from './component';
import { Button, ButtonConfig } from './button';
import copy from 'copy-to-clipboard';

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

  data?: { shareLink?: null };
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

  private facebookButton: Button<ButtonConfig>;
  private twitterButton: Button<ButtonConfig>;
  private emailButton: Button<ButtonConfig>;
  private linkButton: Button<ButtonConfig>;

  constructor(config: SharePanelConfig = {}) {
    super(config);

    this.facebookButton = new Button({
      cssClasses: ['ui-sharebutton', 'ui-facebooksharebutton'],
      text: 'Facebook',
    });
    
    this.twitterButton = new Button({
      cssClasses: ['ui-sharebutton', 'ui-twittersharebutton'],
      text: 'Twitter',
    });
    
    this.emailButton = new Button({
      cssClasses: ['ui-sharebutton', 'ui-emailsharebutton'],
      text: 'Email',
    });
    
    this.linkButton = new Button({
      cssClasses: ['ui-sharebutton', 'ui-linksharebutton'],
      text: 'Link',
    });
    
    this.config = this.mergeConfig(config, {
      cssClasses: ['ui-settings-panel', 'ui-share-panel'],
      hidden: true,
      hideDelay: 3000,
      pageTransitionAnimation: true,
      components: [
        this.facebookButton,
        this.twitterButton,
        this.emailButton,
        this.linkButton,
      ]
    } as SharePanelConfig, this.config);
  }

  configure(player: PlayerAPI, uimanager: UIInstanceManager): void {
    super.configure(player, uimanager);

    let config = this.getConfig();
    let uiconfig = uimanager.getConfig();
    
    let title = uiconfig.metadata.title;

    console.log('SharePanel.configure - config.data', config.data)

    // Use a custom supplied share link if passed,
    // otherwise use the current window location.
    let shareLink = config.data && config.data.shareLink
      ? config.data.shareLink
      : window.location.href;

    this.facebookButton.onClick.subscribe(() => {
      let shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${shareLink}`
      window.open(shareUrl, 'facebookwindow','left=20,top=20,width=600,height=700,toolbar=0,resizable=1');
    })
    this.twitterButton.onClick.subscribe(() => {
      let shareUrl = `https://twitter.com/share?&url=${shareLink}`
      window.open(shareUrl, 'twitterwindow','left=20,top=20,width=600,height=300,toolbar=0,resizable=1');
    })
    this.emailButton.onClick.subscribe(() => {
      window.open(`mailto:?subject=${title}&body=${shareLink}`)
    })
    this.linkButton.onClick.subscribe(() => {
      copy(shareLink);
      alert('Link copied to clipboard 👍');
    })

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
