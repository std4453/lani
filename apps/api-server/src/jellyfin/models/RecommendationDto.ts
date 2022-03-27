/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { BaseItemDto } from './BaseItemDto';
import type { RecommendationType } from './RecommendationType';

export type RecommendationDto = {
    Items?: Array<BaseItemDto> | null;
    RecommendationType?: RecommendationType;
    BaselineItemName?: string | null;
    CategoryId?: string;
};
