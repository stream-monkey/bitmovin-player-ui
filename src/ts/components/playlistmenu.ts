import { Container, ContainerConfig } from './container';
import { UIInstanceManager } from '../uimanager';
import { Timeout } from '../timeout';
import { PlayerAPI } from 'bitmovin-player';
import { PlaylistMenuItem } from './playlistmenuitem';
import { PlaylistMenuNavButton } from './playlistmenunavbutton';
import { CloseButton } from './closebutton';

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

  items: any[];

  isMobileMenu?: boolean;
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
    config.items.forEach((item, index) => {
      itemComponents.push(new PlaylistMenuItem({
        index,
        title: item.title,
        mediaType: item.media_type,
        duration: item.duration,
      }));
    });

    if (config.isMobileMenu) {
      itemComponents.unshift(new Container({
        cssClasses: ['ui-playlistmenu-closebutton-container'],
        components: [new CloseButton({ target: this })]
      }));
    }

    let playlistMenu = new Container({
      cssClasses: ['ui-playlistmenu'],
      components: itemComponents,
    });

    // // The mobile menu needs to include a close button.
    // if (config.isMobileMenu) {
    //   playlistMenu.addComponent(new CloseButton({ target: this }));
    // }

    components.push(playlistMenu);

    this.config = this.mergeConfig(config, {
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
    // And only add the nav buttons if there are > 4 playlist items,
    // otherwise, they all appear within the available space
    // (and only if it's not the mobile menu).
    if ( ! config.isMobileMenu && config.items.length > 4) {
      let playlistMenuDom = this.getDomElement().find(`.${this.prefixCss('ui-playlistmenu')}`);

      // Wait to initialize the nav buttons until the menu has height
      // (i.e. the menu item images have loaded).
      let navButtonInit = setInterval(() => {
        let itemImageHeight = playlistMenuDom.find(`.${this.prefixCss('ui-playlistmenuitem')} .playlist-thumbnail`).height();
        if (itemImageHeight === 0) {
          return;
        }

        clearInterval(navButtonInit);

        let backNavButton = new PlaylistMenuNavButton({ playlistMenu: playlistMenuDom });
        let forwardNavButton = new PlaylistMenuNavButton({ playlistMenu: playlistMenuDom, isForward: true });
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
