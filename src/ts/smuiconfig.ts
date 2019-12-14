import { UIConfig } from './uiconfig';

/**
 * Extend the default UIConfig to include a custom
 * object that we can use to past in custom data,
 * e.g. for playlist menu generation.
 */
export interface SmUIConfig extends UIConfig {
    custom?: object
}