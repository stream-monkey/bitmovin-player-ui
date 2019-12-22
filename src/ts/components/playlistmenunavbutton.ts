import {ButtonConfig, Button} from './button';
import {UIInstanceManager} from '../uimanager';
import { PlayerAPI } from 'bitmovin-player';
import { DOM } from '../dom';

/**
 * Configuration interface for the {@link PlaylistMenuNavButton}.
 */
export interface PlaylistMenuNavButtonConfig extends ButtonConfig {
  /**
   * The playlist menu whose position the button should alter.
   */
  // playlistMenu: PlaylistMenu;
  playlistMenu: DOM;

  topPosition?: number;

  /**
   *  Forward vs. back navigation direction.
   */
  isForward?: boolean;
}

/**
 * A button that closes (hides) a configured component.
 */
export class PlaylistMenuNavButton extends Button<PlaylistMenuNavButtonConfig> {

  constructor(config: PlaylistMenuNavButtonConfig) {
    super(config);

    let cssClasses = ['ui-playlistmenunavbutton',
      `ui-playlistmenunavbutton-${config.isForward ? 'forward' : 'back'}`];

    this.config = this.mergeConfig(config, {
      hidden: this.initiallyHidden(),
      cssClasses,
      text: (config.isForward ? 'Forward' : 'Back'),
    } as PlaylistMenuNavButtonConfig, this.config);
  }

  initiallyHidden() {
    // If this is the back button, hide it initially.
    if ( ! this.config.isForward) {
      return true;
    }
    else {
      // If it's the forward button and there are less than four items, 
      // we're automatically "at the end," so hide it.
      const containerDom = this.config.playlistMenu;
      if (containerDom.find(`.${this.prefixCss('ui-playlistmenuitem')}`).length < 4) {
        return true;
      }
    }

    // By default, it's visible.
    return false;
  }

  scrollAtBeginning() {
    const container = this.config.playlistMenu.get(0);
    return container.scrollLeft === 0;
  }

  scrollAtEnd() {
    const container = this.config.playlistMenu.get(0);
    return container.offsetWidth + container.scrollLeft == container.scrollWidth;
  }

  toggleVisibility() {
    // Forward button.
    if (this.config.isForward) {
      // if (atEnd) this.hide();
      if (this.scrollAtEnd()) {
        this.hide();
      }
      else {
        this.show();
      }
    }
    // Back button.
    else {
      // if (atBeginning) this.hide();
      if (this.scrollAtBeginning()) {
        this.hide();
      }
      else {
        this.show();
      }
    }
  }
  
  configure(player: PlayerAPI, uimanager: UIInstanceManager): void {
    super.configure(player, uimanager);

    let config = this.getConfig();

    // Set the position.
    let playlistMenuEl = config.playlistMenu.get(0);
    // console.log('playlistMenuEl - offsetTop, clientHeight', playlistMenuEl.offsetTop, playlistMenuEl.clientHeight)
    let offsetTop = playlistMenuEl.offsetTop - playlistMenuEl.clientHeight / 2 + 16;
    this.getDomElement().get(0).style.top = `${offsetTop}px`;

    this.onClick.subscribe(() => {
      const containerDom = config.playlistMenu;
      const container = containerDom.get(0);
      const itemWidth = containerDom.find(`.${this.prefixCss('ui-playlistmenuitem')}`).width();

      // Four items are shown at a time; scroll "a page" each time.
      const scrollPageWidth = itemWidth * 4;
      
      const newPosition = config.isForward
        ? container.scrollLeft + scrollPageWidth
        : container.scrollLeft - scrollPageWidth;
      container.scroll({ left: newPosition, behavior: 'smooth' });

      // And now alter the visibility e.g. if scrolled to the start/end.
      let toggleVisibilityInterval = setInterval(() => {
        // When done scrolling, toggle an on-scroll event for the
        // main container so it triggers the visiblity check for
        // both the back and forward buttons.
        const doneScrolling = (container.scrollLeft === newPosition)
          || this.scrollAtBeginning() || this.scrollAtEnd();
        if (doneScrolling) {
          clearInterval(toggleVisibilityInterval);
          config.playlistMenu.get(0).dispatchEvent(new Event('scroll'));
        }
      }, 100);
    });
  }
}