/**
 * @file Implementation of the Observer design pattern.
 *
 *       In this implementation, Observers are simply notified that a state change has occurred, without any details
 *       about the change (they must check for the changes separately, if needed).
 *
 *       The user of this class has the responsibility of managing the observed state
 *       and deciding when to notify the observers.
 * @author Stacey Beard
 * @date 2022-05-19
 */

export class Observer {
    /**
     * @desc An array of functions to call when the state managed by this observer changes.
     * @type {function[]}
     */
    observers = [];

    /**
     * @desc Attaches an observer function to this object. This function will be called by notify().
     * @param fun The observer function to attach to this object.
     */
    attach(fun) {
        this.observers.push(fun);
    }

    /**
     * @desc This function should be called when the observed state changes, to notify all attached observers
     *       of a change.
     */
    notify() {
        this.observers.forEach(fun => fun());
    }
}
