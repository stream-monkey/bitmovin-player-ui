import {ButtonConfig, Button} from './button';
import {PlaylistMenu} from './playlistmenu';
import {UIInstanceManager} from '../uimanager';
import {Component, ComponentConfig} from './component';
import { PlayerAPI } from 'bitmovin-player';

/**
 * Configuration interface for the {@link PlaylistMenuNavButton}.
 */
export interface PlaylistMenuNavButtonConfig extends ButtonConfig {
  /**
   * The playlist menu whose position the button should alter.
   */
  playlistMenu: PlaylistMenu;

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
      cssClasses,
      text: (config.isForward ? 'Forward' : 'Back'),
    } as PlaylistMenuNavButtonConfig, this.config);
  }

  configure(player: PlayerAPI, uimanager: UIInstanceManager): void {
    super.configure(player, uimanager);

    let config = this.getConfig();

    config.playlistMenu.onHoverChanged.subscribe(() => {
      console.log('playlistmenu.onHoverChanged...');

      // @TODO: Do this check on scroll...
      const container = config.playlistMenu.getDomElement().get(0);
      const atEnd = container.offsetWidth + container.scrollLeft == container.scrollWidth;
      console.log('container.scrollLeft', container.scrollLeft)
      console.log('atEnd', atEnd)
      if (atEnd && config.isForward) {
        this.hide();
      }
    });

    this.onClick.subscribe(() => {
      const containerDom = config.playlistMenu.getDomElement();
      const container = containerDom.get(0);
      const itemWidth = containerDom.find('.bmpui-ui-playlistmenuitem').width();

      // Four items are shown at a time; scroll "a page" each time.
      const scrollPageWidth = itemWidth * 4;
      
      const newPosition = config.isForward
        ? container.scrollLeft + scrollPageWidth
        : container.scrollLeft - scrollPageWidth;
      container.scroll({ left: newPosition, behavior: 'smooth' });


      // @TODO: Actually scroll when clicking...
      // ...

      // // @TODO: Do this check on scroll...
      // const container = config.playlistMenu.getDomElement().get(0);
      // const atEnd = container.offsetWidth + container.scrollLeft == container.scrollWidth;
      // console.log('container.scrollLeft', container.scrollLeft)
      // console.log('atEnd', atEnd)
      // if (atEnd && config.isForward) {
      //   this.hide();
      // }
    });
  }
}