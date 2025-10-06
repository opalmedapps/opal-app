// SPDX-FileCopyrightText: Copyright (C) 2025 Opal Health Informatics Group at the Research Institute of the McGill University Health Centre <john.kildea@mcgill.ca>
//
// SPDX-License-Identifier: Apache-2.0

import React from "react";

import { Group, Text } from '@mantine/core';

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
