import { Container, ContainerConfig } from './container';
import { UIInstanceManager } from '../uimanager';
import { Timeout } from '../timeout';
import { PlayerAPI } from 'bitmovin-player';
import { PlaylistMenuItem } from './playlistmenuitem';
import { PlaylistMenuNavButton } from './playlistmenunavbutton';
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

  // navButtons?: PlaylistMenuNavButton[];

  includeNavButtons?: boolean;
}

/**
 * A menu for navigating through a playlist.
 */
export class PlaylistMenu extends Container<PlaylistMenuConfig> {

  private hideTimeout: Timeout;

  constructor(config: PlaylistMenuConfig) {
    super(config);

    let components: any[] = [];
    let itemComponents: any[] = [];

    config.data.items.forEach(item => {
      itemComponents.push(new PlaylistMenuItem(item));
    });

    components.push(new Container({
      cssClasses: ['ui-playlistmenu'],
      components: itemComponents,
    }));

    this.config = this.mergeConfig(config, {
      // cssClasses: ['ui-playlistmenu'],
      cssClasses: ['ui-playlistmenu-wrapper'],
      hidden: true,
      hideDelay: 3000,
      components,
    } as PlaylistMenuConfig, this.config);
  }

  configure(player: PlayerAPI, uimanager: UIInstanceManager): void {
    super.configure(player, uimanager);

    let config = this.getConfig();
    let uiconfig = uimanager.getConfig();

    this.onHoverChanged.subscribe(() => {
      const hoveredClass = this.prefixCss('ui-playlistmenu-wrapper-hovered');
      if (this.isHovered()) {
        this.getDomElement().addClass(hoveredClass);
      }
      else {
        this.getDomElement().removeClass(hoveredClass);
      }
    })

    // Do this after the fact so that they have access to
    // this initialized PlaylistMenu component.
    let backNavButton : PlaylistMenuNavButton;
    let forwardNavButton : PlaylistMenuNavButton;
    if (config.includeNavButtons) {
      let playlistMenuDom = this.getDomElement().find(`.${this.prefixCss('ui-playlistmenu')}`);

      // Wait to initialize the nav buttons until the menu has height
      // (i.e. the menu item images have loaded).
      let navButtonInit = setInterval(() => {
        if (playlistMenuDom.get(0).clientHeight === 0) return;

        clearInterval(navButtonInit);

        backNavButton = new PlaylistMenuNavButton({ playlistMenu: playlistMenuDom });
        forwardNavButton = new PlaylistMenuNavButton({ playlistMenu: playlistMenuDom, isForward: true });
        backNavButton.configure(player, uimanager);
        forwardNavButton.configure(player, uimanager);
        this.addComponent(backNavButton);
        this.addComponent(forwardNavButton);
  
        // Create the actual DOM elements with the nav buttons.
        this.updateComponents();

        // Toggle button appropriately based on whether we're at the
        // start or end of the overall scroll position.
        playlistMenuDom.get(0).addEventListener('scroll', function(e) {
          backNavButton.toggleVisibility();
          forwardNavButton.toggleVisibility();
        });
      }, 100);
    }
    
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
