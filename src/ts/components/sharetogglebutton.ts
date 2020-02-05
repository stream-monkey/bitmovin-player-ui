import {ToggleButton, ToggleButtonConfig} from './togglebutton';
import {SharePanel} from './sharepanel';
import {SettingsPanel} from './settingspanel';
import {UIInstanceManager} from '../uimanager';
import {Component, ComponentConfig} from './component';
import {ArrayUtils} from '../arrayutils';
import { PlayerAPI } from 'bitmovin-player';
import { i18n } from '../localization/i18n';

/**
 * Configuration interface for the {@link ShareToggleButton}.
 */
export interface ShareToggleButtonConfig extends ToggleButtonConfig {
  /**
   * The share panel whose visibility the button should toggle.
   */
  sharePanel: SharePanel;

  /**
   * Any other settings panels that need to be hidden before this
   * one is shown.
   */
  otherSettingsPanels?: Component<ComponentConfig>[];
}

/**
 * A button that toggles visibility of a share panel.
 */
export class ShareToggleButton extends ToggleButton<ShareToggleButtonConfig> {

  private visibleSettingsPanels: (SharePanel|SettingsPanel)[] = [];

  constructor(config: ShareToggleButtonConfig) {
    super(config);

    if (!config.sharePanel) {
      throw new Error('Required SharePanel is missing');
    }

    this.config = this.mergeConfig(config, {
      cssClass: 'ui-sharetogglebutton',
      text: i18n.getLocalizer('share'),
      sharePanel: null,
    }, <ShareToggleButtonConfig>this.config);
  }

  configure(player: PlayerAPI, uimanager: UIInstanceManager): void {
    super.configure(player, uimanager);

    let config = this.getConfig();
    let sharePanel = config.sharePanel;

    this.onClick.subscribe(() => {
      // only hide other `SharePanel`s if a new one will be opened
      if (!sharePanel.isShown()) {
        // Hide all open SharePanels before opening this button's panel
        // (We need to iterate a copy because hiding them will automatically remove themselves from the array
        // due to the subscribeOnce above)
        this.visibleSettingsPanels.slice().forEach(sharePanel => sharePanel.hide());
      }
      sharePanel.toggleHidden();
    });
    sharePanel.onShow.subscribe(() => {
      // Set toggle status to on when the share panel shows
      this.on();
    });
    sharePanel.onHide.subscribe(() => {
      // Set toggle status to off when the share panel hides
      this.off();
    });

    // Ensure that only one `SettingPanel` or `SharePanel` is visible at once
    // Keep track of shown SettingsPanels & SharePanels
    uimanager.onComponentShow.subscribe((sender: Component<ComponentConfig>) => {
      if (sender instanceof SettingsPanel || sender instanceof SharePanel) {
        this.visibleSettingsPanels.push(sender);
        sender.onHide.subscribeOnce(() => ArrayUtils.remove(this.visibleSettingsPanels, sender));
      }
    });
  }
}
