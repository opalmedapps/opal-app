// SPDX-FileCopyrightText: Copyright (C) 2025 Opal Health Informatics Group at the Research Institute of the McGill University Health Centre <john.kildea@mcgill.ca>
//
// SPDX-License-Identifier: Apache-2.0

import React from 'react';
import { useTranslation } from 'react-i18next';

import { Text } from '@mantine/core';

/**
 * @description A simple header used to display a date above some of the items in a list.
 * @param {Date} date The date to display.
 */
export function ListDateHeader({ date }) {
    const { t } = useTranslation();

    return (
        <div className="list-header">
            <Text c="#787878" fz="lg">
                {t('intlDateTime', {
                    val: date,
                    formatParams: {
                        val: { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' },
                    },
                })}
            </Text>
        </div>
    )
}
