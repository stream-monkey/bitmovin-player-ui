import {ToggleButton, ToggleButtonConfig} from './togglebutton';
import {PlaylistMenu} from './playlistmenu';
import {UIInstanceManager} from '../uimanager';
import {Component, ComponentConfig} from './component';
import {ArrayUtils} from '../arrayutils';
import { PlayerAPI } from 'bitmovin-player';
import { i18n } from '../localization/i18n';

/**
 * Configuration interface for the {@link PlaylistMenuToggleButton}.
 */
export interface PlaylistMenuToggleButtonConfig extends ToggleButtonConfig {
  /**
   * The playlist menu whose visibility the button should toggle.
   */
  playlistMenu: PlaylistMenu;
}

/**
 * A button that toggles visibility of a playlist menu.
 */
export class PlaylistMenuToggleButton extends ToggleButton<PlaylistMenuToggleButtonConfig> {

  private visiblePlaylistMenus: PlaylistMenu[] = [];

  constructor(config: PlaylistMenuToggleButtonConfig) {
    super(config);

    if (!config.playlistMenu) {
      throw new Error('Required PlaylistMenu is missing');
    }

    this.config = this.mergeConfig(config, {
      cssClass: 'ui-playlistmenutogglebutton',
      text: i18n.getLocalizer('playlist menu'),
      playlistMenu: null,
    }, <PlaylistMenuToggleButtonConfig>this.config);
  }

  configure(player: PlayerAPI, uimanager: UIInstanceManager): void {
    super.configure(player, uimanager);

    let config = this.getConfig();
    let playlistMenu = config.playlistMenu;

    this.onClick.subscribe(() => {
      // only hide other `PlaylistMenu`s if a new one will be opened
      if (!playlistMenu.isShown()) {
        // Hide all open PlaylistMenus before opening this button's panel
        // (We need to iterate a copy because hiding them will automatically remove themselves from the array
        // due to the subscribeOnce above)
        this.visiblePlaylistMenus.slice().forEach(playlistMenu => playlistMenu.hide());
      }
      playlistMenu.toggleHidden();
    });
    playlistMenu.onShow.subscribe(() => {
      // Set toggle status to on when the playlist menu shows
      this.on();
    });
    playlistMenu.onHide.subscribe(() => {
      // Set toggle status to off when the playlist menu hides
      this.off();
    });

    // Ensure that only one `SettingPanel` is visible at once
    // Keep track of shown PlaylistMenus
    uimanager.onComponentShow.subscribe((sender: Component<ComponentConfig>) => {
      if (sender instanceof PlaylistMenu) {
        this.visiblePlaylistMenus.push(sender);
        sender.onHide.subscribeOnce(() => ArrayUtils.remove(this.visiblePlaylistMenus, sender));
      }
    });
  }
}
