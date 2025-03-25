// SPDX-FileCopyrightText: Copyright (C) 2023 Opal Health Informatics Group at the Research Institute of the McGill University Health Centre <john.kildea@mcgill.ca>
//
// SPDX-License-Identifier: Apache-2.0

/**
 * @file Error thrown when cancelling a Promise.
 *       This is currently used by the RequestToServer service to cancel listener requests.
 */

export class CancelledPromiseError extends Error {
    constructor() {
        super('Promise was cancelled');
    }
}
