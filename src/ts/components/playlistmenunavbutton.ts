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

    this.onClick.subscribe(() => {
      const container = config.playlistMenu.getDomElement().get(0);
      const atEnd = container.offsetWidth + container.scrollLeft == container.scrollWidth;
      console.log('container.scrollLeft', container.scrollLeft)
      console.log('atEnd', atEnd)
      
      if (atEnd && config.isForward) {
        this.hide();
      }
    });
  }
}