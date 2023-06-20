/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

/**
 * Class CultureDto.
 */
export type CultureDto = {
  /**
   * Gets the name.
   */
  Name?: string;
  /**
   * Gets the display name.
   */
  DisplayName?: string;
  /**
   * Gets the name of the two letter ISO language.
   */
  TwoLetterISOLanguageName?: string;
  /**
   * Gets the name of the three letter ISO language.
   */
  readonly ThreeLetterISOLanguageName?: string | null;
  ThreeLetterISOLanguageNames?: Array<string>;
};
