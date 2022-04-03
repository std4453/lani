/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { SessionInfo } from './SessionInfo';
import type { UserDto } from './UserDto';

export type AuthenticationResult = {
    /**
     * Class UserDto.
     */
    User?: UserDto | null;
    /**
     * Class SessionInfo.
     */
    SessionInfo?: SessionInfo | null;
    AccessToken?: string | null;
    ServerId?: string | null;
};
