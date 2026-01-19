// SPDX-FileCopyrightText: Copyright (C) 2020 Opal Health Informatics Group at the Research Institute of the McGill University Health Centre <john.kildea@mcgill.ca>
//
// SPDX-License-Identifier: Apache-2.0

import {SecurityQuestion} from "./SecurityQuestion";

/**
 * SecurityAnswer class to model the security answer from the back-end
 */
export class SecurityAnswer {
    constructor({id, question}, $filter) {
        // The questions are not translated and are being saved in the language they were originally answered
        let title = question;
        this.securityAnswerSerNum = Number(id);
        this.question = new SecurityQuestion({title});
        this.oldQuestion = new SecurityQuestion({title});
        this.answer = "";
        this.answerHasChanged = false;
        this.questionHasChanged = false;
        this.oldAnswerPlaceholder = $filter('translate')('SECURITY_ANSWER_UPDATE_PLACEHOLDER');
    }
}
