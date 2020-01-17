import { SubtitleOverlay } from './components/subtitleoverlay';
import { SettingsPanelPage } from './components/settingspanelpage';
import { SettingsPanelItem } from './components/settingspanelitem';
import { VideoQualitySelectBox } from './components/videoqualityselectbox';
import { PlaybackSpeedSelectBox } from './components/playbackspeedselectbox';
import { AudioTrackSelectBox } from './components/audiotrackselectbox';
import { AudioQualitySelectBox } from './components/audioqualityselectbox';
import { SettingsPanel } from './components/settingspanel';
import { SubtitleSettingsPanelPage } from './components/subtitlesettings/subtitlesettingspanelpage';
import { SettingsPanelPageOpenButton } from './components/settingspanelpageopenbutton';
import { SubtitleSettingsLabel } from './components/subtitlesettings/subtitlesettingslabel';
import { SubtitleSelectBox } from './components/subtitleselectbox';
import { SharePanel } from './components/sharepanel';
import { PlaylistMenu } from './components/playlistmenu';
import { PlaylistMenuNavButton } from './components/playlistmenunavbutton';
import { PlaylistMenuToggleButton } from './components/playlistmenutogglebutton';
import { ControlBar } from './components/controlbar';
import { Container } from './components/container';
import { PlaybackTimeLabel, PlaybackTimeLabelMode } from './components/playbacktimelabel';
import { SeekBar } from './components/seekbar';
import { SeekBarLabel } from './components/seekbarlabel';
import { PlaybackToggleButton } from './components/playbacktogglebutton';
import { VolumeToggleButton } from './components/volumetogglebutton';
import { VolumeSlider } from './components/volumeslider';
import { Spacer } from './components/spacer';
import { PictureInPictureToggleButton } from './components/pictureinpicturetogglebutton';
import { AirPlayToggleButton } from './components/airplaytogglebutton';
import { CastToggleButton } from './components/casttogglebutton';
import { VRToggleButton } from './components/vrtogglebutton';
import { ShareToggleButton } from './components/sharetogglebutton';
import { SettingsToggleButton } from './components/settingstogglebutton';
import { FullscreenToggleButton } from './components/fullscreentogglebutton';
import { UIContainer } from './components/uicontainer';
import { BufferingOverlay } from './components/bufferingoverlay';
import { PlaybackToggleOverlay } from './components/playbacktoggleoverlay';
import { CastStatusOverlay } from './components/caststatusoverlay';
import { TitleBar } from './components/titlebar';
import { RecommendationOverlay } from './components/recommendationoverlay';
import { ErrorMessageOverlay } from './components/errormessageoverlay';
import { AdClickOverlay } from './components/adclickoverlay';
import { AdMessageLabel } from './components/admessagelabel';
import { AdSkipButton } from './components/adskipbutton';
import { CloseButton } from './components/closebutton';
import { MetadataLabel, MetadataLabelContent } from './components/metadatalabel';
import { PlayerUtils } from './playerutils';
import { Label } from './components/label';
import { CastUIContainer } from './components/castuicontainer';
import { UIConditionContext, UIManager } from './uimanager';
import { UIConfig } from './uiconfig';
import { PlayerAPI } from 'bitmovin-player';
import { i18n } from './localization/i18n';

export namespace SmUIFactory {

  // export function buildSmDefaultUI(player: PlayerAPI, config: UIConfig = {}): UIManager {
  //   return SmUIFactory.buildSmUI(player, config);
  // }

  // export function buildSmDefaultSmallScreenUI(player: PlayerAPI, config: UIConfig = {}): UIManager {
  //   return SmUIFactory.buildSmSmallScreenUI(player, config);
  // }

  // export function buildSmDefaultCastReceiverUI(player: PlayerAPI, config: UIConfig = {}): UIManager {
  //   return SmUIFactory.buildSmCastReceiverUI(player, config);
  // }

  export function isPlaylist(data: any) {
    return data.playlistItems && data.playlistItems.length > 0;
  }

  function modernUI(data: any) {
    // If it's a playlist, add a custom class & playlist menu.
    const isPlaylist = SmUIFactory.isPlaylist(data);

    let controlBar;

    // Establish the top control bar components up here, as they're
    // shared whether or not the rest of the controls are disabled.
    let controlBarTopComponents = data.seekBarDisabled
      ? []
      : [
        new PlaybackTimeLabel({ timeLabelMode: PlaybackTimeLabelMode.CurrentTime, hideInLivePlayback: true }),
        new SeekBar({ label: new SeekBarLabel() }),
        new PlaybackTimeLabel({ timeLabelMode: PlaybackTimeLabelMode.TotalTime, cssClasses: ['text-right'] })
      ];

    if ( ! data.controlsDisabled) {
      let mainSettingsPanelPage = new SettingsPanelPage({
        components: [
          new SettingsPanelItem(i18n.getLocalizer('settings.video.quality'), new VideoQualitySelectBox()),
          new SettingsPanelItem(i18n.getLocalizer('speed'), new PlaybackSpeedSelectBox()),
          new SettingsPanelItem(i18n.getLocalizer('settings.audio.track'), new AudioTrackSelectBox()),
          new SettingsPanelItem(i18n.getLocalizer('settings.audio.quality'), new AudioQualitySelectBox()),
        ],
      });

      let settingsPanel = new SettingsPanel({
        components: [
          mainSettingsPanelPage,
        ],
        hidden: true,
      });

      mainSettingsPanelPage.addComponent(
        new SettingsPanelItem(
          // new SubtitleSettingsLabel({text: i18n.getLocalizer('settings.subtitles'), opener: subtitleSettingsOpenButton}),
          // Don't allow customizing subtitles, i.e. don't include
          // a settings button & page to do so.
          i18n.getLocalizer('settings.subtitles'),
          new SubtitleSelectBox(),
        ));

      let sharePanel;
      
      let controlBarBottomComponents = [
        new PlaybackToggleButton(),
        new VolumeToggleButton(),
        new VolumeSlider(),
        new Spacer(),
        new PictureInPictureToggleButton(),
        new AirPlayToggleButton(),
        new CastToggleButton(),
        new VRToggleButton(),
        new SettingsToggleButton({ settingsPanel: settingsPanel }),
        new FullscreenToggleButton(),
      ];
  
      // Add the share button & panel if sharing is enabled.
      if ( ! data.shareDisabled) {
        sharePanel = new SharePanel({ 
          shareLink: data.shareLink ? data.shareLink : null 
        });
  
        controlBarBottomComponents.splice(
          (controlBarBottomComponents.length - 2), 0, new ShareToggleButton({ sharePanel })
        );
      }
      
      let controlBarComponents: any[] = [
        settingsPanel,
        new Container({
          components: controlBarTopComponents,
          cssClasses: ['controlbar-top'],
        }),
        new Container({
          components: controlBarBottomComponents,
          cssClasses: ['controlbar-bottom'],
        }),
      ];

      if ( ! data.shareDisabled) {
        controlBarComponents.push(sharePanel);
      }

      controlBar = new ControlBar({
        components: controlBarComponents,
      });
    }
    // If controls are disabled, only show the seek bar.
    else {
      // ...but if the seek bar is also disabled,
      // show nothing.
      let controlBarComponents = data.seekBarDisabled
        ? []
        : [
          new Container({
            components: controlBarTopComponents,
            cssClasses: ['controlbar-top'],
          }),
        ];

      controlBar = new ControlBar({
        components: controlBarComponents
      });
    }

    // Assemble all container components.
    let components: any[] = [
      new SubtitleOverlay(),
      new BufferingOverlay(),
      new PlaybackToggleOverlay(),
      new CastStatusOverlay(),
      new RecommendationOverlay(),
      new ErrorMessageOverlay(),
      controlBar
    ];

    // If playlist data was passed, add the playlist's menu.
    let playlistMenu;
    if (isPlaylist) {
      playlistMenu = new PlaylistMenu({ items: data.playlistItems });
      components.push(playlistMenu);
    }

    return new UIContainer({
      cssClasses: [(isPlaylist ? 'ui-is-playlist' : '')],
      components: components,
      hideDelay: 2000,
      hidePlayerStateExceptions: [
        PlayerUtils.PlayerState.Prepared,
        PlayerUtils.PlayerState.Paused,
        PlayerUtils.PlayerState.Finished,
      ],
    });
  }

  export function modernAdsUI(data: any) {
    return new UIContainer({
      components: [
        new BufferingOverlay(),
        new AdClickOverlay(),
        new PlaybackToggleOverlay(),
        new Container({
          components: [
            new AdMessageLabel({ text: i18n.getLocalizer('ads.remainingTime')}),
            new AdSkipButton(),
          ],
          cssClass: 'ui-ads-status',
        }),
        new ControlBar({
          components: [
            new Container({
              components: [
                new PlaybackToggleButton(),
                new VolumeToggleButton(),
                new VolumeSlider(),
                new Spacer(),
                new FullscreenToggleButton(),
              ],
              cssClasses: ['controlbar-bottom'],
            }),
          ],
        }),
      ],
      cssClasses: ['ui-skin-ads'],
      hideDelay: 2000,
      hidePlayerStateExceptions: [
        PlayerUtils.PlayerState.Prepared,
        PlayerUtils.PlayerState.Paused,
        PlayerUtils.PlayerState.Finished,
      ],
    });
  }

  export function modernSmallScreenUI(data: any) {
    // If it's a playlist, add a custom class & playlist menu.
    const isPlaylist = SmUIFactory.isPlaylist(data);

    // Intial set of components.
    let components: any[] = [
      new SubtitleOverlay(),
      new BufferingOverlay(),
      new CastStatusOverlay(),
      new PlaybackToggleOverlay(),
      new RecommendationOverlay(),
      new ErrorMessageOverlay()
    ];

    if ( ! data.controlsDisabled) {
      let mainSettingsPanelPage = new SettingsPanelPage({
        components: [
          new SettingsPanelItem(i18n.getLocalizer('settings.video.quality'), new VideoQualitySelectBox()),
          new SettingsPanelItem(i18n.getLocalizer('speed'), new PlaybackSpeedSelectBox()),
          new SettingsPanelItem(i18n.getLocalizer('settings.audio.track'), new AudioTrackSelectBox()),
          new SettingsPanelItem(i18n.getLocalizer('settings.audio.quality'), new AudioQualitySelectBox()),
        ],
      });
  
      let settingsPanel = new SettingsPanel({
        components: [
          mainSettingsPanelPage,
        ],
        hidden: true,
        pageTransitionAnimation: false,
        hideDelay: -1,
      });
  
      mainSettingsPanelPage.addComponent(
        new SettingsPanelItem(
          // Don't allow customizing subtitles, i.e. don't include
          // a settings button & page to do so.
          i18n.getLocalizer('settings.subtitles'),
          new SubtitleSelectBox(),
        ));
  
      settingsPanel.addComponent(new CloseButton({ target: settingsPanel }));
      
      // All title bar components.
      let titleBarComponents = [
        // Dummy label with no content to move buttons to the right.
        new Label({ cssClass: 'label-metadata-title' }),
        new CastToggleButton(),
        new VRToggleButton(),
        new PictureInPictureToggleButton(),
        new AirPlayToggleButton(),
        new VolumeToggleButton(),
        new SettingsToggleButton({ settingsPanel: settingsPanel }),
        new FullscreenToggleButton(),
      ];

      // Add the share button & panel if sharing is enabled.
      let sharePanel;
      if ( ! data.shareDisabled) {
        sharePanel = new SharePanel({ 
          shareLink: data.shareLink ? data.shareLink : null 
        });
        sharePanel.addComponent(new CloseButton({ target: sharePanel }));

        titleBarComponents.splice(
          (titleBarComponents.length - 3), 0, new ShareToggleButton({ sharePanel })
        );
      }

      // Add the settings panel & title bar.
      components.push(
        settingsPanel, 
        new TitleBar({
          components: titleBarComponents,
        })
      );

      // Add the share button & panel if sharing is enabled.
      if ( ! data.shareDisabled) {
        components.push(sharePanel);
      }

      // If playlist data was passed, add the playlist's menu.
      if (isPlaylist) {
        let playlistMenu = new PlaylistMenu({ 
          items: data.playlistItems,
          hideDelay: -1,
          isMobileMenu: true
        });
        titleBarComponents.splice(1, 0, new PlaylistMenuToggleButton({ playlistMenu }));

        components.push(playlistMenu);
      }
    }
    
    // If it's not disabled, add the seek bar.
    if ( ! data.seekBarDisabled) {
      components.splice(
        components.length - 1, 
        0, 
        new ControlBar({
          components: [
            new Container({
              components: [
                new PlaybackTimeLabel({ timeLabelMode: PlaybackTimeLabelMode.CurrentTime, hideInLivePlayback: true }),
                new SeekBar({ label: new SeekBarLabel() }),
                new PlaybackTimeLabel({ timeLabelMode: PlaybackTimeLabelMode.TotalTime, cssClasses: ['text-right'] }),
              ],
              cssClasses: ['controlbar-top'],
            }),
          ],
        })
      );
    }

    let cssClasses = ['ui-skin-smallscreen']
    if (isPlaylist) {
      cssClasses.push('ui-is-playlist');
    }

    return new UIContainer({
      components,
      cssClasses,
      hideDelay: 2000,
      hidePlayerStateExceptions: [
        PlayerUtils.PlayerState.Prepared,
        PlayerUtils.PlayerState.Paused,
        PlayerUtils.PlayerState.Finished,
      ],
    });
  }

  export function modernSmallScreenAdsUI(data: any) {
    return new UIContainer({
      components: [
        new BufferingOverlay(),
        new AdClickOverlay(),
        new PlaybackToggleOverlay(),
        new TitleBar({
          components: [
            // Dummy label with no content to move buttons to the right.
            new Label({ cssClass: 'label-metadata-title' }),
            new FullscreenToggleButton(),
          ],
        }),
        new Container({
          components: [
            new AdMessageLabel({ text: 'Ad: {remainingTime} secs' }),
            new AdSkipButton(),
          ],
          cssClass: 'ui-ads-status',
        }),
      ],
      cssClasses: ['ui-skin-ads', 'ui-skin-smallscreen'],
      hideDelay: 2000,
      hidePlayerStateExceptions: [
        PlayerUtils.PlayerState.Prepared,
        PlayerUtils.PlayerState.Paused,
        PlayerUtils.PlayerState.Finished,
      ],
    });
  }

  export function modernCastReceiverUI(data: any) {
    let controlBar = new ControlBar({
      components: [
        new Container({
          components: [
            new PlaybackTimeLabel({ timeLabelMode: PlaybackTimeLabelMode.CurrentTime, hideInLivePlayback: true }),
            new SeekBar({ smoothPlaybackPositionUpdateIntervalMs: -1 }),
            new PlaybackTimeLabel({ timeLabelMode: PlaybackTimeLabelMode.TotalTime, cssClasses: ['text-right'] }),
          ],
          cssClasses: ['controlbar-top'],
        }),
      ],
    });

    return new CastUIContainer({
      components: [
        new SubtitleOverlay(),
        new BufferingOverlay(),
        new PlaybackToggleOverlay(),
        controlBar,
        new ErrorMessageOverlay(),
      ],
      cssClasses: ['ui-skin-cast-receiver'],
      hideDelay: 2000,
      hidePlayerStateExceptions: [
        PlayerUtils.PlayerState.Prepared,
        PlayerUtils.PlayerState.Paused,
        PlayerUtils.PlayerState.Finished,
      ],
    });
  }

  export function buildSmUI(player: PlayerAPI, config: UIConfig = {}, data: any): UIManager {
    // console.log('buildSmUI - config, data', config, data)

    // show smallScreen UI only on mobile/handheld devices
    let smallScreenSwitchWidth = 600;

    return new UIManager(player, [{
      ui: modernSmallScreenAdsUI(data),
      condition: (context: UIConditionContext) => {
        return context.isMobile && context.documentWidth < smallScreenSwitchWidth && context.isAd
          && context.adRequiresUi;
      },
    }, {
      ui: modernAdsUI(data),
      condition: (context: UIConditionContext) => {
        return context.isAd && context.adRequiresUi;
      },
    }, {
      ui: modernSmallScreenUI(data),
      condition: (context: UIConditionContext) => {
        return !context.isAd && !context.adRequiresUi && context.isMobile
          && context.documentWidth < smallScreenSwitchWidth;
      },
    }, {
      ui: modernUI(data),
      condition: (context: UIConditionContext) => {
        return !context.isAd && !context.adRequiresUi;
      },
    }], config);
  }

  export function buildSmSmallScreenUI(player: PlayerAPI, config: UIConfig = {}, data: any): UIManager {
    return new UIManager(player, [{
      ui: modernSmallScreenAdsUI(data),
      condition: (context: UIConditionContext) => {
        return context.isAd && context.adRequiresUi;
      },
    }, {
      ui: modernSmallScreenUI(data),
      condition: (context: UIConditionContext) => {
        return !context.isAd && !context.adRequiresUi;
      },
    }], config);
  }

  export function buildSmCastReceiverUI(player: PlayerAPI, config: UIConfig = {}, data: any): UIManager {
    return new UIManager(player, modernCastReceiverUI(data), config);
  }
}
