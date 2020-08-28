import { ButtonConfig, Button } from './button';
import { UIInstanceManager } from '../uimanager';
import { Timeout } from '../timeout';
import { StringUtils } from '../stringutils';
import { AdEvent, LinearAd, PlayerAPI } from 'bitmovin-player';

/**
 * Configuration interface for the {@link UnmuteButton}.
 */
export interface UnmuteButtonConfig extends ButtonConfig {
  // ...
}

/**
 * A button that is displayed during ads and can be used to skip the ad.
 */
export class UnmuteButton extends Button<UnmuteButtonConfig> {

  constructor(config: UnmuteButtonConfig = {}) {
    super(config);

    this.config = this.mergeConfig(config, <UnmuteButtonConfig>{
      cssClass: 'ui-button-unmute',
    }, this.config);
  }

  configure(player: PlayerAPI, uimanager: UIInstanceManager): void {
    super.configure(player, uimanager);

    let config = this.getConfig();

    let playerConfig = player.getConfig();

    let isMuted = player.isMuted();
    let isAutoplay = playerConfig.playback && playerConfig.playback.autoplay
      && playerConfig.playback.autoplay === true;

    // Not muted & auto-played? Just abort.
    if ( ! (isAutoplay && isMuted)) {
      return;
    }

    let hideTimeout = new Timeout(10000, () => {
      this.hide();
    });

    let readyHandler = () => {
      this.show();
      this.setText('Unmute');
    }

    let playingHandler = () => {
      // Hide after 10 seconds.
      hideTimeout.start();
    }

    // If unmuted, hide the button.
    let unmutedHandler = () => {
      this.hide();
    }

    player.on(player.exports.PlayerEvent.Ready, readyHandler);
    player.on(player.exports.PlayerEvent.Playing, playingHandler);
    player.on(player.exports.PlayerEvent.Unmuted, unmutedHandler);

    this.onClick.subscribe(() => {
      player.unmute();
    });
  }
}