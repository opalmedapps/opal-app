// SPDX-FileCopyrightText: Copyright (C) 2020 Opal Health Informatics Group at the Research Institute of the McGill University Health Centre <john.kildea@mcgill.ca>
//
// SPDX-License-Identifier: Apache-2.0

/**
 * SecurityQuestion class to model the security question from the back-end
 */
export class SecurityQuestion {
    constructor({title_en, title_fr}) {
        this.questionText_EN = title_en;
        this.questionText_FR = title_fr;
    }
}
