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
   * Default: 5 seconds (5000)
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
    // let isAutoplay = playerConfig.playback && playerConfig.playback.autoplay
    //   && playerConfig.playback.autoplay === true;
    
    // Not muted? Just abort.
    if ( ! isMuted) {
      return;
    }

    // @NOTE: I'm doing the "autoplay" check below with timestamps,
    // because our player doesn't use the playback.autoplay setting
    // for some strange UI conflict reason.
    // 
    // // Not muted & auto-played? Just abort.
    // if ( ! (isAutoplay && isMuted)) {
    //   return;
    // }

    let hideAfterFadeOutTimeout = new Timeout(1000, () => {
      this.hide();
    });

    let hideTimeout = new Timeout(config.hideDelay, () => {
      this.getDomElement().addClass('bmpui-fadeout');
      
      hideAfterFadeOutTimeout.start();
    });

    let showDelay = new Timeout(500, () => {
      this.show();
    });

    let readyTime = 0;

    let readyHandler = () => {
      readyTime = Date.now();
    }

    let playingTime = 0;

    let playingHandler = () => {
      playingTime = Date.now();

      // If the video was played within a second of the player being ready,
      // assume "autoplay", and show the unmute button.
      if ((playingTime - readyTime) <= 1000) {
        // Tiny delay to showing to avoid an ugly overlap
        // w/ the play button fade out/animation.
        showDelay.start();

        // Once it starts playing, start the auto-hide timeout.
        hideTimeout.start();
      }
    }

    // If unmuted, hide the button.
    let unmutedHandler = () => {
      this.hide();
    }

    player.on(player.exports.PlayerEvent.Ready, readyHandler);
    player.on(player.exports.PlayerEvent.Playing, playingHandler);
    player.on(player.exports.PlayerEvent.Unmuted, unmutedHandler);
    player.on(player.exports.PlayerEvent.Paused, unmutedHandler);
    player.on(player.exports.PlayerEvent.PlaybackFinished, unmutedHandler);

    this.onClick.subscribe(() => {
      player.unmute();
    });
  }
}