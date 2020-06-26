import {SecurityQuestion} from "./SecurityQuestion";

/**
 * SecurityAnswer class to model the security answer from the back-end
 */
export class SecurityAnswer {
    constructor({SecurityAnswerSerNum, Active, QuestionText_EN, QuestionText_FR, SecurityQuestionSerNum}) {
        this.securityAnswerSerNum = Number(SecurityAnswerSerNum);
        this.question = new SecurityQuestion({Active, QuestionText_EN, QuestionText_FR, SecurityQuestionSerNum});
        this.answer = "";
        this.answerHasChanged = false;
        this.questionHasChanged = false;
        this.oldAnswerPlaceholder = '*********';
    }
}