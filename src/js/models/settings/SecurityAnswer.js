import {SecurityQuestion} from "./SecurityQuestion";

/**
 * SecurityAnswer class to model the security answer from the back-end
 */
export class SecurityAnswer {
    constructor({id, question}) {
        // The questions are not translated and being assigned to both English and French question texts
        let title_en = question;
        let title_fr = question;
        this.securityAnswerSerNum = Number(id);
        this.question = new SecurityQuestion({title_en, title_fr});
        this.answer = "";
        this.answerHasChanged = false;
        this.questionHasChanged = false;
        this.oldAnswerPlaceholder = '*********';
    }
}
