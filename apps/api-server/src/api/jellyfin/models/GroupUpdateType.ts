/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

/**
 * Enum GroupUpdateType.
 */
export enum GroupUpdateType {
    USER_JOINED = 'UserJoined',
    USER_LEFT = 'UserLeft',
    GROUP_JOINED = 'GroupJoined',
    GROUP_LEFT = 'GroupLeft',
    STATE_UPDATE = 'StateUpdate',
    PLAY_QUEUE = 'PlayQueue',
    NOT_IN_GROUP = 'NotInGroup',
    GROUP_DOES_NOT_EXIST = 'GroupDoesNotExist',
    CREATE_GROUP_DENIED = 'CreateGroupDenied',
    JOIN_GROUP_DENIED = 'JoinGroupDenied',
    LIBRARY_ACCESS_DENIED = 'LibraryAccessDenied',
}