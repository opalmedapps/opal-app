// SPDX-FileCopyrightText: Copyright (C) 2025 Opal Health Informatics Group at the Research Institute of the McGill University Health Centre <john.kildea@mcgill.ca>
//
// SPDX-License-Identifier: Apache-2.0

import React from "react";
import { useTranslation } from 'react-i18next';

import { Group, Stack, Text } from '@mantine/core';

/**
 * @description A simple vertical list of items. Typically used with ListItem components as children.
 * @param children The items displayed in the list.
 */
export function List({ children }) {
    return (
        <Stack
            bg="var(--mantine-color-body)"
            align="stretch"
            justify="flex-start"
            gap={0}
        >
            {children}
        </Stack>
    )
}

/**
 * @description A standard Opal list item with an icon on the left, text in the middle, and an optional chevron at the end.
 * @param {string} iconClasses A string of classes used to define the icon, for example, "fa-solid fa-calendar fa-2x".
 * @param {string} iconColor A style value used as the icon's colour (for example, a hex code).
 * @param {string} text The text to display on the item (must already be translated).
 * @param {boolean} showChevron Whether to display a chevron at the end of the item.
 */
export function ListItem({ iconClasses, iconColor, text, showChevron }) {
    let optionalChevron = showChevron
        ? <i className="fa-solid fa-chevron-right fa-1x" style={{color: '#DDD'}} />
        : undefined;

    return (
        <div className="list-item">
            <Group justify="space-between" wrap="nowrap">
                <Group justify="flex-start" wrap="nowrap">
                    <i className={iconClasses} style={{color: iconColor}} />
                    <Text fz="lg" ta="left">{text}</Text>
                </Group>
                {optionalChevron}
            </Group>
        </div>
    )
}

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
