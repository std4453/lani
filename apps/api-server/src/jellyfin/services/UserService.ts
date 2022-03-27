/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { AuthenticateUserByName } from '../models/AuthenticateUserByName';
import type { AuthenticationResult } from '../models/AuthenticationResult';
import type { CreateUserByName } from '../models/CreateUserByName';
import type { ForgotPasswordDto } from '../models/ForgotPasswordDto';
import type { ForgotPasswordPinDto } from '../models/ForgotPasswordPinDto';
import type { ForgotPasswordResult } from '../models/ForgotPasswordResult';
import type { PinRedeemResult } from '../models/PinRedeemResult';
import type { QuickConnectDto } from '../models/QuickConnectDto';
import type { UpdateUserEasyPassword } from '../models/UpdateUserEasyPassword';
import type { UpdateUserPassword } from '../models/UpdateUserPassword';
import type { UserConfiguration } from '../models/UserConfiguration';
import type { UserDto } from '../models/UserDto';
import type { UserPolicy } from '../models/UserPolicy';

import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class UserService {

    /**
     * Gets a list of users.
     * @param isHidden Optional filter by IsHidden=true or false.
     * @param isDisabled Optional filter by IsDisabled=true or false.
     * @returns UserDto Users returned.
     * @throws ApiError
     */
    public static getUsers(
        isHidden?: boolean | null,
        isDisabled?: boolean | null,
    ): CancelablePromise<Array<UserDto>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/Users',
            query: {
                'isHidden': isHidden,
                'isDisabled': isDisabled,
            },
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
            },
        });
    }

    /**
     * Gets a user by Id.
     * @param userId The user id.
     * @returns UserDto User returned.
     * @throws ApiError
     */
    public static getUserById(
        userId: string,
    ): CancelablePromise<UserDto> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/Users/{userId}',
            path: {
                'userId': userId,
            },
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
                404: `User not found.`,
            },
        });
    }

    /**
     * Deletes a user.
     * @param userId The user id.
     * @returns void
     * @throws ApiError
     */
    public static deleteUser(
        userId: string,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/Users/{userId}',
            path: {
                'userId': userId,
            },
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
                404: `User not found.`,
            },
        });
    }

    /**
     * Updates a user.
     * @param userId The user id.
     * @param requestBody The updated user model.
     * @returns void
     * @throws ApiError
     */
    public static updateUser(
        userId: string,
        requestBody: UserDto,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/Users/{userId}',
            path: {
                'userId': userId,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `User information was not supplied.`,
                401: `Unauthorized`,
                403: `User update forbidden.`,
            },
        });
    }

    /**
     * Authenticates a user.
     * @param userId The user id.
     * @param pw The password as plain text.
     * @param password The password sha1-hash.
     * @returns AuthenticationResult User authenticated.
     * @throws ApiError
     */
    public static authenticateUser(
        userId: string,
        pw: string,
        password?: string | null,
    ): CancelablePromise<AuthenticationResult> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/Users/{userId}/Authenticate',
            path: {
                'userId': userId,
            },
            query: {
                'pw': pw,
                'password': password,
            },
            errors: {
                403: `Sha1-hashed password only is not allowed.`,
                404: `User not found.`,
            },
        });
    }

    /**
     * Updates a user configuration.
     * @param userId The user id.
     * @param requestBody The new user configuration.
     * @returns void
     * @throws ApiError
     */
    public static updateUserConfiguration(
        userId: string,
        requestBody: UserConfiguration,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/Users/{userId}/Configuration',
            path: {
                'userId': userId,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                401: `Unauthorized`,
                403: `User configuration update forbidden.`,
            },
        });
    }

    /**
     * Updates a user's easy password.
     * @param userId The user id.
     * @param requestBody The M:Jellyfin.Api.Controllers.UserController.UpdateUserEasyPassword(System.Guid,Jellyfin.Api.Models.UserDtos.UpdateUserEasyPassword) request.
     * @returns void
     * @throws ApiError
     */
    public static updateUserEasyPassword(
        userId: string,
        requestBody: UpdateUserEasyPassword,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/Users/{userId}/EasyPassword',
            path: {
                'userId': userId,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                401: `Unauthorized`,
                403: `User is not allowed to update the password.`,
                404: `User not found.`,
            },
        });
    }

    /**
     * Updates a user's password.
     * @param userId The user id.
     * @param requestBody The M:Jellyfin.Api.Controllers.UserController.UpdateUserPassword(System.Guid,Jellyfin.Api.Models.UserDtos.UpdateUserPassword) request.
     * @returns void
     * @throws ApiError
     */
    public static updateUserPassword(
        userId: string,
        requestBody: UpdateUserPassword,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/Users/{userId}/Password',
            path: {
                'userId': userId,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                401: `Unauthorized`,
                403: `User is not allowed to update the password.`,
                404: `User not found.`,
            },
        });
    }

    /**
     * Updates a user policy.
     * @param userId The user id.
     * @param requestBody The new user policy.
     * @returns void
     * @throws ApiError
     */
    public static updateUserPolicy(
        userId: string,
        requestBody: UserPolicy,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/Users/{userId}/Policy',
            path: {
                'userId': userId,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `User policy was not supplied.`,
                401: `Unauthorized`,
                403: `User policy update forbidden.`,
            },
        });
    }

    /**
     * Authenticates a user by name.
     * @param requestBody The M:Jellyfin.Api.Controllers.UserController.AuthenticateUserByName(Jellyfin.Api.Models.UserDtos.AuthenticateUserByName) request.
     * @returns AuthenticationResult User authenticated.
     * @throws ApiError
     */
    public static authenticateUserByName(
        requestBody: AuthenticateUserByName,
    ): CancelablePromise<AuthenticationResult> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/Users/AuthenticateByName',
            body: requestBody,
            mediaType: 'application/json',
        });
    }

    /**
     * Authenticates a user with quick connect.
     * @param requestBody The Jellyfin.Api.Models.UserDtos.QuickConnectDto request.
     * @returns AuthenticationResult User authenticated.
     * @throws ApiError
     */
    public static authenticateWithQuickConnect(
        requestBody: QuickConnectDto,
    ): CancelablePromise<AuthenticationResult> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/Users/AuthenticateWithQuickConnect',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Missing token.`,
            },
        });
    }

    /**
     * Initiates the forgot password process for a local user.
     * @param requestBody The forgot password request containing the entered username.
     * @returns ForgotPasswordResult Password reset process started.
     * @throws ApiError
     */
    public static forgotPassword(
        requestBody: ForgotPasswordDto,
    ): CancelablePromise<ForgotPasswordResult> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/Users/ForgotPassword',
            body: requestBody,
            mediaType: 'application/json',
        });
    }

    /**
     * Redeems a forgot password pin.
     * @param requestBody The forgot password pin request containing the entered pin.
     * @returns PinRedeemResult Pin reset process started.
     * @throws ApiError
     */
    public static forgotPasswordPin(
        requestBody: ForgotPasswordPinDto,
    ): CancelablePromise<PinRedeemResult> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/Users/ForgotPassword/Pin',
            body: requestBody,
            mediaType: 'application/json',
        });
    }

    /**
     * Gets the user based on auth token.
     * @returns UserDto User returned.
     * @throws ApiError
     */
    public static getCurrentUser(): CancelablePromise<UserDto> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/Users/Me',
            errors: {
                400: `Token is not owned by a user.`,
                401: `Unauthorized`,
                403: `Forbidden`,
            },
        });
    }

    /**
     * Creates a user.
     * @param requestBody The create user by name request body.
     * @returns UserDto User created.
     * @throws ApiError
     */
    public static createUserByName(
        requestBody: CreateUserByName,
    ): CancelablePromise<UserDto> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/Users/New',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
            },
        });
    }

    /**
     * Gets a list of publicly visible users for display on a login screen.
     * @returns UserDto Public users returned.
     * @throws ApiError
     */
    public static getPublicUsers(): CancelablePromise<Array<UserDto>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/Users/Public',
        });
    }

}