import {ComponentConfig, Component} from './component';
import { ButtonConfig, Button } from './button';
import {DOM} from '../dom';
import {EventDispatcher, NoArgs, Event} from '../eventdispatcher';
import { LocalizableText , i18n } from '../localization/i18n';

/**
 * Configuration interface for a {@link PlaylistMenuItemConfig} component.
 */
export interface PlaylistMenuItemConfig extends ButtonConfig {
  text?: string;
}

/**
 * A simple clickable button.
 */
export class PlaylistMenuItem<Config extends PlaylistMenuItemConfig> extends Component<Config> {

  private buttonEvents = {
    onClick: new EventDispatcher<Button<Config>, NoArgs>(),
  };

  constructor(config: Config) {
    super(config);

    this.config = this.mergeConfig(config, {
      cssClasses: ['ui-button', 'ui-playlistmenuitem'],
    } as Config, this.config);
  }

  protected toDomElement(): DOM {
    // Create the button element with the text label
    let buttonElement = new DOM('button', {
      'type': 'button',
      'id': this.config.id,
      'class': this.getCssClasses(),
    }).append(new DOM('span', {
      'class': this.prefixCss('label'),
    }).html(this.config.text));

    // Listen for the click event on the button element and trigger the corresponding event on the button component
    buttonElement.on('click', () => {
      // this.onClickEvent();
      alert('Do sumpin!');
    });

    return buttonElement;
  }

  /**
   * Sets text on the label of the button.
   * @param text the text to put into the label of the button
   */
  setText(text: string): void {
    this.getDomElement().find('.' + this.prefixCss('label')).html(text);
  }

  // protected onClickEvent() {
  //   this.buttonEvents.onClick.dispatch(this);
  // }

  // /**
  //  * Gets the event that is fired when the button is clicked.
  //  * @returns {Event<Button<Config>, NoArgs>}
  //  */
  // get onClick(): Event<Button<Config>, NoArgs> {
  //   return this.buttonEvents.onClick.getEvent();
  // }
}