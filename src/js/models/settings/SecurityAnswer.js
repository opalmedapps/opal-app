import {SecurityQuestion} from "./SecurityQuestion";

/**
 * SecurityAnswer class to model the security answer from the back-end
 */
export class SecurityAnswer {
    constructor({id, question}) {
        this.securityAnswerSerNum = Number(id);
        this.question = new SecurityQuestion({id, question});
        this.answer = "";
        this.answerHasChanged = false;
        this.questionHasChanged = false;
        this.oldAnswerPlaceholder = '*********';
    }
}
