import {Component} from './component';
import { ButtonConfig, Button } from './button';
import {DOM} from '../dom';
import {EventDispatcher, NoArgs, Event} from '../eventdispatcher';
import {UIInstanceManager} from '../uimanager';
import { PlayerAPI } from 'bitmovin-player';
import { PlaylistMenu } from './playlistmenu';

/**
 * Configuration interface for a {@link PlaylistMenuItemConfig} component.
 */
export interface PlaylistMenuItemConfig extends ButtonConfig {
  index: number;
  title: string;
  duration?: number;
  mediaType: string;
  playlistMenu: PlaylistMenu;
  isActive: boolean;
  isOffline: boolean;
}

/**
 * A simple clickable button.
 */
export class PlaylistMenuItem<Config extends PlaylistMenuItemConfig> extends Component<Config> {

  private buttonEvents = {
    onClick: new EventDispatcher<PlaylistMenuItem<Config>, NoArgs>(),
  };

  private itemClass: string = 'ui-playlistmenuitem';
  private itemActiveClass: string = 'ui-playlistmenuitem-active';

  constructor(config: Config) {
    super(config);

    let cssClasses = [this.itemClass];
    if (config.isActive) {
      cssClasses.push(this.itemActiveClass);
    }

    this.config = this.mergeConfig(config, {
      cssClasses,
    } as Config, this.config);
  }

  configure(player: PlayerAPI, uimanager: UIInstanceManager): void {
    super.configure(player, uimanager);

    this.onClick.subscribe(() => {
      let event = new CustomEvent('playlistitemchanged', { detail: {
        index: this.config.index,
      }});
      player.getContainer().dispatchEvent(event);

      // Remove the active class from all other playlist menu items,
      // and add it to this one.
      const activeClass = this.prefixCss(this.itemActiveClass);
      this.config.playlistMenu.getDomElement().find(`.${this.prefixCss(this.itemClass)}`)
        .get().forEach(playlistMenuItemEl => {
          new DOM(playlistMenuItemEl).removeClass(activeClass);
        });
      this.getDomElement().addClass(activeClass);
    });
  }

  protected toDomElement(): DOM {
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

    let titleEl = new DOM('p', {
      class: 'playlist-title',
    }).html(this.config.title);

    let durationEl = new DOM('span', {
      class: 'playlist-duration',
    }).html(this.durationContent());

    let statusEl = new DOM('div', {
      class: 'playlist-item-playing',
    }).html(this.activeLabelContent());

    // News team, ASSEMBLE!
    detailsEl.append(titleEl, durationEl, statusEl);
    itemButtonContentEl.append(thumbnailEl, detailsEl);
    itemButtonEl.append(itemButtonContentEl);
    itemEl.append(itemButtonEl);

    // Listen for the click event on the button element and trigger the corresponding event on the button component
    itemEl.on('click', () => {
      this.onClickEvent();
    });

    return itemEl;
  }

  protected durationTimestamp() {
    if ( ! this.config.duration) return null;

    return new Date(this.config.duration * 1000)
      .toISOString().substr(11, 8);
  }

  protected durationContent() {
    let durationContent: string;
    
    switch (this.config.mediaType) {
      case 'on_demand_video':
        durationContent = this.durationTimestamp();
        break;
      case 'live_stream':
        durationContent = `<i class="fal fa-broadcast-tower"></i>`;
        break;
      case 'playlist':
        durationContent = `<i class="fal fa-folder"></i>`;
        break;
    }

    return durationContent;
  }

  protected activeLabelContent() {
    let labelContent: string;

    if (this.config.mediaType === 'playlist') {
      labelContent = 'Loading...';
    }
    else {
      labelContent = this.config.isOffline
        ? 'Offline'
        : 'Now Playing';
    }

    return labelContent;
  }

  protected onClickEvent() {
    this.buttonEvents.onClick.dispatch(this);
  }

  /**
   * Gets the event that is fired when the button is clicked.
   * @returns {Event<PlaylistMenuItem<Config>, NoArgs>}
   */
  get onClick(): Event<PlaylistMenuItem<Config>, NoArgs> {
    return this.buttonEvents.onClick.getEvent();
  }
}