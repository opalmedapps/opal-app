// SPDX-FileCopyrightText: Copyright (C) 2025 Opal Health Informatics Group at the Research Institute of the McGill University Health Centre <john.kildea@mcgill.ca>
//
// SPDX-License-Identifier: Apache-2.0

export class ListUtility {
    /**
     * @description Groups elements in a list by matching dates, and returns a new data object with the dates as keys.
     *              Note that time is not considered; items with the same date (regardless of time) will be grouped.
     * @param list The list to organize.
     * @param dateAttribute The attribute in each element in the list that contains a date value.
     */
    static groupByDate(list, dateAttribute) {
        // Formatting info to create a string key representing each date
        const dateOptions = {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
        }

        const dateList = {};

        list.forEach(item => {
            let stringDate = item[dateAttribute].toLocaleDateString(undefined, dateOptions);

            if (dateList.hasOwnProperty(stringDate)) dateList[stringDate].push(item);
            else dateList[stringDate] = [item];
        })

        return dateList;
    }
}
