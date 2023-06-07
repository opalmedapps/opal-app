/**
 * SecurityQuestion class to model the security question from the back-end
 */
export class SecurityQuestion {
    constructor({id, question}) {
        this.active = true;
        this.questionText_EN = question;
        this.questionText_FR = question;
        this.securityQuestionSerNum = Number(id);
    }
}
