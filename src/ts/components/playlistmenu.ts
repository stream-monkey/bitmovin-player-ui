import { Container, ContainerConfig } from './container';
import { UIInstanceManager } from '../uimanager';
import { Timeout } from '../timeout';
import { PlayerAPI } from 'bitmovin-player';
import { PlaylistMenuItem, PlaylistMenuItemConfig } from './playlistmenuitem';
import { Button, ButtonConfig } from './button';

/**
 * Configuration interface for a {@link PlaylistMenu}.
 */
export interface PlaylistMenuConfig extends ContainerConfig {
  /**
   * The delay in milliseconds after which the share panel will be hidden when there is no user interaction.
   * Set to -1 to disable automatic hiding.
   * Default: 3 seconds (3000)
   */
  hideDelay?: number;

  data: { items: any[] };
}

/**
 * A menu for navigating through a playlist.
 */
export class PlaylistMenu extends Container<PlaylistMenuConfig> {

  private hideTimeout: Timeout;

  constructor(config: PlaylistMenuConfig) {
    super(config);

    let allComponents: any[] = [];

    // @TODO:
    // Create PlaylistMenuItem components here!
    config.data.items.forEach(item => {
      allComponents.push(
        new PlaylistMenuItem({ text: item.title })
        // new Button({ text: item.title })
      );
    });

    console.log('PlaylistMenu - allComponents', allComponents)

    // @TODO:
    // I'm gonna need to add like close & nav button components 
    // here too, yeah? Can they just be Button components??
    // ...
    
    this.config = this.mergeConfig(config, {
      cssClasses: ['ui-playlistmenu'],
      hidden: false, // true,
      hideDelay: 3000,
      components: allComponents,
    } as PlaylistMenuConfig, this.config);
  }

  configure(player: PlayerAPI, uimanager: UIInstanceManager): void {
    super.configure(player, uimanager);

    let config = this.getConfig();
    let uiconfig = uimanager.getConfig();
    
    console.log('PlaylistMenu.configure - config.data', config.data)

    
    // Auto-hiding.
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