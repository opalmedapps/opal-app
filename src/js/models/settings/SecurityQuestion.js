/**
 * SecurityQuestion class to model the security question from the back-end
 */
export class SecurityQuestion {
    constructor({Active, QuestionText_EN, QuestionText_FR, SecurityQuestionSerNum}) {
        this.active = Active === "1";
        this.questionText_EN = QuestionText_EN;
        this.questionText_FR = QuestionText_FR;
        this.securityQuestionSerNum = Number(SecurityQuestionSerNum);
    }
}