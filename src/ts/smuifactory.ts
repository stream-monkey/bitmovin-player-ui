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
import { UnmuteButton } from './components/unmutebutton';
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

  function isPlaylistPlayer(data: any) {
    return data.playlist 
      && data.playlist.items && data.playlist.items.length > 0;
  }

  function modernUI(data: any) {
    // If it's a playlist, add a custom class & playlist menu.
    const isPlaylist = isPlaylistPlayer(data);

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

    let subtitleOverlay = new SubtitleOverlay();

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

      let subtitleSettingsPanelPage = new SubtitleSettingsPanelPage({
        settingsPanel: settingsPanel,
        overlay: subtitleOverlay,
      });
  
      const subtitleSelectBox = new SubtitleSelectBox();
  
      let subtitleSettingsOpenButton = new SettingsPanelPageOpenButton({
        targetPage: subtitleSettingsPanelPage,
        container: settingsPanel,
        ariaLabel: i18n.getLocalizer('settings.subtitles'),
        text: i18n.getLocalizer('open'),
      });
  
      mainSettingsPanelPage.addComponent(
        new SettingsPanelItem(
          new SubtitleSettingsLabel({
            text: i18n.getLocalizer('settings.subtitles'),
            opener: subtitleSettingsOpenButton,
          }),
          subtitleSelectBox,
          {
            role: 'menubar',
          },
        ));
  
      settingsPanel.addComponent(subtitleSettingsPanelPage);

      // mainSettingsPanelPage.addComponent(
      //   new SettingsPanelItem(
      //     // Don't allow customizing subtitles, i.e. don't include
      //     // a settings button & page to do so.
      //     i18n.getLocalizer('settings.subtitles'),
      //     new SubtitleSelectBox(),
      //   ));

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
      subtitleOverlay,
      new BufferingOverlay(),
      new PlaybackToggleOverlay(),
      new CastStatusOverlay(),
      new RecommendationOverlay(),
      new ErrorMessageOverlay(),
      new Container({
        components: [
          new UnmuteButton(),
        ],
        cssClass: 'ui-unmute',
      }),
      controlBar
    ];

    // If playlist data was passed, add the playlist's menu.
    let playlistMenu;
    if (isPlaylist) {
      playlistMenu = new PlaylistMenu({ 
        items: data.playlist.items, 
        activeIndex: data.playlist.activeIndex,
        activeItemOffline: data.isOffline ? data.isOffline : false
      });
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
    const isPlaylist = isPlaylistPlayer(data);

    let subtitleOverlay = new SubtitleOverlay();

    // Intial set of components.
    let components: any[] = [
      subtitleOverlay,
      new BufferingOverlay(),
      new CastStatusOverlay(),
      new PlaybackToggleOverlay(),
      new RecommendationOverlay(),
      new ErrorMessageOverlay()
    ];

    if ( ! data.controlsDisabled) {
      // let mainSettingsPanelPage = new SettingsPanelPage({
      //   components: [
      //     new SettingsPanelItem(i18n.getLocalizer('settings.video.quality'), new VideoQualitySelectBox()),
      //     new SettingsPanelItem(i18n.getLocalizer('speed'), new PlaybackSpeedSelectBox()),
      //     new SettingsPanelItem(i18n.getLocalizer('settings.audio.track'), new AudioTrackSelectBox()),
      //     new SettingsPanelItem(i18n.getLocalizer('settings.audio.quality'), new AudioQualitySelectBox()),
      //   ],
      // });
  
      // let settingsPanel = new SettingsPanel({
      //   components: [
      //     mainSettingsPanelPage,
      //   ],
      //   hidden: true,
      //   pageTransitionAnimation: false,
      //   hideDelay: -1,
      // });
  
      // mainSettingsPanelPage.addComponent(
      //   new SettingsPanelItem(
      //     // Don't allow customizing subtitles, i.e. don't include
      //     // a settings button & page to do so.
      //     i18n.getLocalizer('settings.subtitles'),
      //     new SubtitleSelectBox(),
      //   ));
  
      // settingsPanel.addComponent(new CloseButton({ target: settingsPanel }));

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

      let subtitleSettingsPanelPage = new SubtitleSettingsPanelPage({
        settingsPanel: settingsPanel,
        overlay: subtitleOverlay,
      });

      let subtitleSettingsOpenButton = new SettingsPanelPageOpenButton({
        targetPage: subtitleSettingsPanelPage,
        container: settingsPanel,
        ariaLabel: i18n.getLocalizer('settings.subtitles'),
        text: i18n.getLocalizer('open'),
      });

      const subtitleSelectBox = new SubtitleSelectBox();

      mainSettingsPanelPage.addComponent(
        new SettingsPanelItem(
          new SubtitleSettingsLabel({
            text: i18n.getLocalizer('settings.subtitles'),
            opener: subtitleSettingsOpenButton,
          }),
          subtitleSelectBox,
          {
            role: 'menubar',
          },
        ));

      settingsPanel.addComponent(subtitleSettingsPanelPage);

      settingsPanel.addComponent(new CloseButton({ target: settingsPanel }));
      subtitleSettingsPanelPage.addComponent(new CloseButton({ target: settingsPanel }));
      
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
          items: data.playlist.items, 
          activeIndex: data.playlist.activeIndex,
          activeItemOffline: data.isOffline ? data.isOffline : false,
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

    let cssClasses = ['ui-skin-smallscreen'];
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
  
  // For customizing the highlight color or "theme", just inject
  // a <style> block within the player container with the custom color value.
  // This prevents having to, e.g., extend the necessary components
  // simply to supply a custom color, which would be foolish and fragile,
  // in terms of any future Bitmovin UI library updates.
  function addCustomStyles(player: PlayerAPI, data: any) {
    // Remove any previously-added custom style blocks.
    let existingStyleBlocks = player.getContainer().querySelectorAll('style');
    if (existingStyleBlocks.length > 0) {
      existingStyleBlocks.forEach(styleBlock => styleBlock.remove());
    }

    // Gather any custom style rules.
    let customStyles: String = '';

    if (data.highlightColor) {
      customStyles += `
        .bmpui-ui-seekbar .bmpui-seekbar .bmpui-seekbar-playbackposition, 
        .bmpui-ui-volumeslider .bmpui-seekbar .bmpui-seekbar-playbackposition {
          background-color: ${data.highlightColor}; 
        }
        .bmpui-ui-playbacktimelabel.bmpui-ui-playbacktimelabel-live.bmpui-ui-playbacktimelabel-live-edge::before {
          color: ${data.highlightColor};
        }
      `;
    }

    // If a theme is set, make the (currently laughably minor)
    // style additions.
    if (data.theme) {
      switch (data.theme) {
        case 'bar_dark':
          customStyles += `
            .bmpui-ui-controlbar {
              background-color: rgba(0, 0, 0, 0.8);
            }
          `;
          break;
      }
    }

    // Excellent. If offline, inject the offline image
    // into the existing Bitmovin player poster element.
    if (data.isOffline) {
      const offlineImage = data.offlineImage
        ? data.offlineImage
        : '//images.streammonkey.com/offline.jpg';
      
      // Set the bitmovinplayer-poster's image to our offline image
      // and hide the main controls.
      // Note that if viewing within a playlist, the playlist menu
      // still needs to be accessible.
      customStyles += `
        /* Force-show the poster with the offline image. */
        .bitmovinplayer-poster {
          display: block !important;
          background-image: url('${offlineImage}') !important;
        }

        
        /* Show the big play button container even if the player goes "idle",
        which makes sure to still allow for the hover to show the playlist menu;
        otherwise, if it hits that idle state, you'll never be able
        to hover/view the playlist menu again. */
        .bmpui-ui-uicontainer.bmpui-player-state-idle .bmpui-ui-hugeplaybacktogglebutton {
          display: inline-block;
        }

        /* Hide the big play button & all of the normal controls. */
        .bmpui-ui-playbacktoggle-overlay .bmpui-ui-hugeplaybacktogglebutton .bmpui-image,
        .bmpui-ui-controlbar {
          display: none;
        }
      `;
    }

    // If set, append the custom styles now.
    if (customStyles) {
      player.getContainer().insertAdjacentHTML(
        'afterbegin', 
        `<style>
          ${customStyles}
        </style>`
      );
    }
  }

  export function buildSmUI(player: PlayerAPI, config: UIConfig = {}, data: any): UIManager {
    // Inject any custom styling onto the page
    // that's not done via components.
    addCustomStyles(player, data);

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
