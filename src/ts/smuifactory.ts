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

  function modernUI() {
    let subtitleOverlay = new SubtitleOverlay();

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

    // let subtitleSettingsPanelPage = new SubtitleSettingsPanelPage({
    //   settingsPanel: settingsPanel,
    //   overlay: subtitleOverlay,
    // });

    // let subtitleSettingsOpenButton = new SettingsPanelPageOpenButton({
    //   targetPage: subtitleSettingsPanelPage,
    //   container: settingsPanel,
    //   text: i18n.getLocalizer('open'),
    // });

    mainSettingsPanelPage.addComponent(
      new SettingsPanelItem(
        // new SubtitleSettingsLabel({text: i18n.getLocalizer('settings.subtitles'), opener: subtitleSettingsOpenButton}),
        // Don't allow customizing subtitles, i.e. don't include
        // a settings button & page to do so.
        i18n.getLocalizer('settings.subtitles'),
        new SubtitleSelectBox(),
      ));

    // settingsPanel.addComponent(subtitleSettingsPanelPage);

    let controlBar = new ControlBar({
      components: [
        settingsPanel,
        new Container({
          components: [
            new PlaybackTimeLabel({ timeLabelMode: PlaybackTimeLabelMode.CurrentTime, hideInLivePlayback: true }),
            new SeekBar({ label: new SeekBarLabel() }),
            new PlaybackTimeLabel({ timeLabelMode: PlaybackTimeLabelMode.TotalTime, cssClasses: ['text-right'] }),
          ],
          cssClasses: ['controlbar-top'],
        }),
        new Container({
          components: [
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
          ],
          cssClasses: ['controlbar-bottom'],
        }),
      ],
    });

    return new UIContainer({
      components: [
        subtitleOverlay,
        new BufferingOverlay(),
        new PlaybackToggleOverlay(),
        new CastStatusOverlay(),
        controlBar,
        // new TitleBar(),
        new RecommendationOverlay(),
        new ErrorMessageOverlay(),
      ],
      hideDelay: 2000,
      hidePlayerStateExceptions: [
        PlayerUtils.PlayerState.Prepared,
        PlayerUtils.PlayerState.Paused,
        PlayerUtils.PlayerState.Finished,
      ],
    });
  }

  export function modernAdsUI() {
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

  export function modernSmallScreenUI() {
    let subtitleOverlay = new SubtitleOverlay();

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

    // let subtitleSettingsPanelPage = new SubtitleSettingsPanelPage({
    //   settingsPanel: settingsPanel,
    //   overlay: subtitleOverlay,
    // });

    // let subtitleSettingsOpenButton = new SettingsPanelPageOpenButton({
    //   targetPage: subtitleSettingsPanelPage,
    //   container: settingsPanel,
    //   text: i18n.getLocalizer('open'),
    // });

    mainSettingsPanelPage.addComponent(
      new SettingsPanelItem(
        // new SubtitleSettingsLabel({text: i18n.getLocalizer('settings.subtitles'), opener: subtitleSettingsOpenButton}),
        // Don't allow customizing subtitles, i.e. don't include
        // a settings button & page to do so.
        i18n.getLocalizer('settings.subtitles'),
        new SubtitleSelectBox(),
      ));

    // settingsPanel.addComponent(subtitleSettingsPanelPage);

    settingsPanel.addComponent(new CloseButton({ target: settingsPanel }));
    // subtitleSettingsPanelPage.addComponent(new CloseButton({ target: settingsPanel }));

    let controlBar = new ControlBar({
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
    });

    return new UIContainer({
      components: [
        subtitleOverlay,
        new BufferingOverlay(),
        new CastStatusOverlay(),
        new PlaybackToggleOverlay(),
        new RecommendationOverlay(),
        controlBar,
        // new TitleBar({
        //   components: [
        //     // dummy label with no content to move buttons to the right
        //     new Label({ cssClass: 'label-metadata-title' }),
        //     new FullscreenToggleButton(),
        //   ],
        // }),
        new TitleBar({
          components: [
            // Don't show the title.
            // new MetadataLabel({ content: MetadataLabelContent.Title }),
            // dummy label with no content to move buttons to the right
            new Label({ cssClass: 'label-metadata-title' }),
            new CastToggleButton(),
            new VRToggleButton(),
            new PictureInPictureToggleButton(),
            new AirPlayToggleButton(),
            new VolumeToggleButton(),
            new SettingsToggleButton({ settingsPanel: settingsPanel }),
            new FullscreenToggleButton(),
          ],
        }),
        settingsPanel,
        new ErrorMessageOverlay(),
      ],
      cssClasses: ['ui-skin-smallscreen'],
      hideDelay: 2000,
      hidePlayerStateExceptions: [
        PlayerUtils.PlayerState.Prepared,
        PlayerUtils.PlayerState.Paused,
        PlayerUtils.PlayerState.Finished,
      ],
    });
  }

  export function modernSmallScreenAdsUI() {
    return new UIContainer({
      components: [
        new BufferingOverlay(),
        new AdClickOverlay(),
        new PlaybackToggleOverlay(),
        new TitleBar({
          components: [
            // dummy label with no content to move buttons to the right
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

  export function modernCastReceiverUI() {
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
        new TitleBar({ keepHiddenWithoutMetadata: true }),
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

  export function buildSmUI(player: PlayerAPI, config: UIConfig = {}): UIManager {
    // show smallScreen UI only on mobile/handheld devices
    let smallScreenSwitchWidth = 600;

    return new UIManager(player, [{
      ui: modernSmallScreenAdsUI(),
      condition: (context: UIConditionContext) => {
        return context.isMobile && context.documentWidth < smallScreenSwitchWidth && context.isAd
          && context.adRequiresUi;
      },
    }, {
      ui: modernAdsUI(),
      condition: (context: UIConditionContext) => {
        return context.isAd && context.adRequiresUi;
      },
    }, {
      ui: modernSmallScreenUI(),
      condition: (context: UIConditionContext) => {
        return !context.isAd && !context.adRequiresUi && context.isMobile
          && context.documentWidth < smallScreenSwitchWidth;
      },
    }, {
      ui: modernUI(),
      condition: (context: UIConditionContext) => {
        return !context.isAd && !context.adRequiresUi;
      },
    }], config);
  }

  export function buildSmSmallScreenUI(player: PlayerAPI, config: UIConfig = {}): UIManager {
    return new UIManager(player, [{
      ui: modernSmallScreenAdsUI(),
      condition: (context: UIConditionContext) => {
        return context.isAd && context.adRequiresUi;
      },
    }, {
      ui: modernSmallScreenUI(),
      condition: (context: UIConditionContext) => {
        return !context.isAd && !context.adRequiresUi;
      },
    }], config);
  }

  export function buildSmCastReceiverUI(player: PlayerAPI, config: UIConfig = {}): UIManager {
    return new UIManager(player, modernCastReceiverUI(), config);
  }
}
