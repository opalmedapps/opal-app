// SPDX-FileCopyrightText: Copyright (C) 2022 Opal Health Informatics Group at the Research Institute of the McGill University Health Centre <john.kildea@mcgill.ca>
//
// SPDX-License-Identifier: Apache-2.0

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
     * @description An array of functions to call when the state managed by this observer changes.
     * @type {function[]}
     */
    observers = [];

    /**
     * @description Attaches an observer function to this object. This function will be called by notify().
     * @param {function} fun The observer function to attach to this object.
     */
    attach(fun) {
        this.observers.push(fun);
    }

    /**
     * @description Notifies all attached observers of a change.
     *              This function should be called whenever the observed state changes.
     */
    notify() {
        this.observers.forEach(fun => fun());
    }

    /**
     * @description Unsubscribes all observer functions attached to this object.
     */
    clear() {
        this.observers = [];
    }
}
