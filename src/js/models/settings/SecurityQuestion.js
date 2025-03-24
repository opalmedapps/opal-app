/**
 * SecurityQuestion class to model the security question from the back-end
 */
export class SecurityQuestion {
    constructor({title_en, title_fr}) {
        this.questionText_EN = title_en;
        this.questionText_FR = title_fr;
    }
}
