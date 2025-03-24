/**
 * SecurityQuestion class to model the security question from the back-end
 */
export class SecurityQuestion {
    constructor({id, question}) {
        // The 3 security questions we have in the backend are all active. Leave `active` as true until we set this attribute in the backend when we have more questions in the future.
        this.active = true;
        this.question = question;
        this.securityQuestionSerNum = Number(id);
    }
}
