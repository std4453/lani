/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

/**
 * Class CultureDto.
 */
export type CultureDto = {
    /**
     * Gets or sets the name.
     */
    Name?: string | null;
    /**
     * Gets or sets the display name.
     */
    DisplayName?: string | null;
    /**
     * Gets or sets the name of the two letter ISO language.
     */
    TwoLetterISOLanguageName?: string | null;
    /**
     * Gets or sets the name of the three letter ISO language.
     */
    readonly ThreeLetterISOLanguageName?: string | null;
    ThreeLetterISOLanguageNames?: Array<string> | null;
};
