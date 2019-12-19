import {ComponentConfig, Component} from './component';
import { ButtonConfig, Button } from './button';
import {DOM} from '../dom';
import {EventDispatcher, NoArgs, Event} from '../eventdispatcher';
import { LocalizableText , i18n } from '../localization/i18n';

/**
 * Configuration interface for a {@link PlaylistMenuItemConfig} component.
 */
export interface PlaylistMenuItemConfig extends ButtonConfig {
  title: string;
  duration?: string;
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
      cssClasses: ['ui-playlistmenuitem'], // 'ui-button'
    } as Config, this.config);
  }

  protected toDomElement(): DOM {
    // Create the button element with the text label
    // let buttonElement = new DOM('button', {
    //   'type': 'button',
    //   'id': this.config.id,
    //   'class': this.getCssClasses(),
    // }).append(new DOM('span', {
    //   'class': this.prefixCss('label'),
    // }).html(this.config.text));

    let itemEl = new DOM('div', {
      id: this.config.id,
      class: this.getCssClasses(),
    });

    let itemButtonEl = new DOM('button', {
      type: 'button',
      class: 'playlist-item-link',
      'data-mediaid': 'bogus',
      'data-video-index': 'bogus',
      'data-media-type': 'bogus',
    });

    let itemButtonContentEl = new DOM('div', {
      class: 'playlist-thumbnail-wrapper',
    });

    let thumbnailEl = new DOM('img', {
      class: 'playlist-thumbnail',
      src: 'https://images.streammonkey.com/560x315/black.jpg',
    });

    let detailsEl = new DOM('div', {
      class: 'playlist-item-inside',
    });

    let statusEl = new DOM('div', {
      class: 'playlist-item-playing',
    });

    let titleEl = new DOM('p', {
      class: 'playlist-title',
    }).html(this.config.title);

    let durationEl = new DOM('span', {
      class: 'playlist-duration',
    }).html(this.config.duration);

    // News team, ASSEMBLE!
    detailsEl.append(statusEl, titleEl, durationEl);
    itemButtonContentEl.append(thumbnailEl, detailsEl);
    itemButtonEl.append(itemButtonContentEl);
    itemEl.append(itemButtonEl);

    // <a class="playlist-item-link active" data-mediaid="5c8823deee38c" data-video-index="0" data-media-type="on_demand_video">
    //   <div class="playlist-thumbnail-wrapper">
    //     <img class="playlist-thumbnail" src="https://images.streammonkey.com/560x315/black.jpg">
    //     <div class="playlist-item-inside">
    //             <div class="playlist-item-playing">Now Playing</div>
    //       <p class="playlist-title">test 4 (copy)</p>
    //       <span class="playlist-duration">00:00:05</span>
    //     </div>
    //   </div>
    // </a>

    // Listen for the click event on the button element and trigger the corresponding event on the button component
    itemEl.on('click', () => {
      // this.onClickEvent();
      alert('Do sumpin!');
    });

    return itemEl;
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