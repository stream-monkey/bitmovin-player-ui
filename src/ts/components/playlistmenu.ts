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

  activeIndex: number;

  isMobileMenu?: boolean;

  activeItemOffline?: boolean;
}

/**
 * A menu for navigating through a playlist.
 */
export class PlaylistMenu extends Container<PlaylistMenuConfig> {

  private hideTimeout: Timeout;
  private playlistMenuItself: Container<ContainerConfig>;
  private hoveredClass = 'ui-playlistmenu-wrapper-hovered';

  constructor(config: PlaylistMenuConfig) {
    super(config);

    let components: any[] = [];
    
    let itemComponents: any[] = [];
    config.items.forEach((item, index) => {
      let isActive = index === config.activeIndex;
      itemComponents.push(new PlaylistMenuItem({
        index,
        title: item.title,
        mediaType: item.media_type,
        image: item.image
          ? `https://images.streammonkey.com/560x315/${item.image.filename}`
          : null,
        duration: item.duration,
        playlistMenu: this,
        isActive,
        isOffline: isActive && config.activeItemOffline,
      }));
    });

    if (config.isMobileMenu) {
      itemComponents.unshift(new Container({
        cssClasses: ['ui-playlistmenu-closebutton-container'],
        components: [new CloseButton({ target: this })]
      }));
    }

    this.playlistMenuItself = new Container({
      cssClasses: ['ui-playlistmenu'],
      components: itemComponents,
    });

    components.push(this.playlistMenuItself);

    this.config = this.mergeConfig(config, {
      cssClasses: ['ui-playlistmenu-wrapper'],
      hidden: true,
      hideDelay: 3000,
      components,
    } as PlaylistMenuConfig, this.config);
  }

  protected setPlaylistTopPosition (shown: boolean) {
    let playlistDom = this.playlistMenuItself.getDomElement();

    // If it's shown, get the position via subtracting the
    // current playlist height from the current window height;
    // if hidden, it goes back to the default 90%;
    let position = shown
      ? `${(window.innerHeight - playlistDom.height())}px`
      : '90%';

    playlistDom.get(0).style.top = position;
  }

  configure(player: PlayerAPI, uimanager: UIInstanceManager): void {
    super.configure(player, uimanager);

    let config = this.getConfig();
    let uiconfig = uimanager.getConfig();

    // Collapse/expand menu on/off hover.
    let collapseMenuTimeout = new Timeout(500, () => {
      this.getDomElement().removeClass(this.prefixCss(this.hoveredClass));
      this.setPlaylistTopPosition(false);
    });
    let showMenu = () => {
      this.getDomElement().addClass(this.prefixCss(this.hoveredClass));
      this.setPlaylistTopPosition(true);
      collapseMenuTimeout.clear();
    };
    let hideMenu = () => {
      collapseMenuTimeout.start();
    };
    this.onHoverChanged.subscribe(() => {
      if (this.isHovered()) {
        showMenu();
      }
      else {
        hideMenu();
      }
    });

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
