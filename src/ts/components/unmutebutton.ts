import { ButtonConfig, Button } from './button';
import { UIInstanceManager } from '../uimanager';
import { Timeout } from '../timeout';
import { StringUtils } from '../stringutils';
import { AdEvent, LinearAd, PlayerAPI } from 'bitmovin-player';

/**
 * Configuration interface for the {@link UnmuteButton}.
 */
export interface UnmuteButtonConfig extends ButtonConfig {
  /**
   * The delay in milliseconds after which the unmute button will be hidden when there is no user interaction.
   * Default: 7 seconds (7000)
   */
  hideDelay?: number;
}

/**
 * A button that is displayed during ads and can be used to skip the ad.
 */
export class UnmuteButton extends Button<UnmuteButtonConfig> {

  constructor(config: UnmuteButtonConfig = {}) {
    super(config);

    this.config = this.mergeConfig(config, <UnmuteButtonConfig>{
      hidden: true,
      cssClass: 'ui-unmutebutton',
      hideDelay: 7000,
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

    let hideTimeout = new Timeout(config.hideDelay, () => {
      this.hide();
    });

    let showDelay = new Timeout(500, () => {
      this.show();
    });

    let readyHandler = () => {
      // // Tiny delay to showing to avoid an ugly overlap
      // // w/ the play button fade out/animation.
      // showDelay.start();
    }

    let playingHandler = () => {
      // Tiny delay to showing to avoid an ugly overlap
      // w/ the play button fade out/animation.
      showDelay.start();

      // Once it starts playing, start the auto-hide timeout.
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