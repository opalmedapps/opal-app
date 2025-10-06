// SPDX-FileCopyrightText: Copyright (C) 2025 Opal Health Informatics Group at the Research Institute of the McGill University Health Centre <john.kildea@mcgill.ca>
//
// SPDX-License-Identifier: Apache-2.0

import React from 'react';
import { useTranslation } from 'react-i18next';

import { Stack } from '@mantine/core';

import { ListDateHeader } from './list/ListDateHeader.js';
import { ListItem } from './list/ListItem.js';
import { ListUtility } from '../models/utility/lists.js';

export default function Diagnoses({ diagnoses }) {
    const { i18n } = useTranslation();
    const language = i18n.language.toUpperCase();

    // Filter out "N/A" diagnoses
    diagnoses = diagnoses.filter(e => {
        return e[`Description_${language}`].toUpperCase() !== 'N/A';
    });

    // Group diagnoses together by date before displaying
    const diagnosesByDate = ListUtility.groupByDate(diagnoses, 'CreationDate');

    const rows = Object.entries(diagnosesByDate).map(entry => {
        const [dateString, values] = entry;

        return (
            <>
                {/* DATE HEADER */}
                <ListDateHeader date={values[0].CreationDate} />
                <Stack
                    bg="var(--mantine-color-body)"
                    align="stretch"
                    justify="flex-start"
                    gap={0}
                >
                    {/* LIST OF DIAGNOSES */}
                    {values.map(diagnosis => (
                        <ListItem
                            key={diagnosis.DiagnosisSerNum}
                            iconClasses="fa-solid fa-stethoscope fa14x"
                            iconColor={'#994741'}
                            text={diagnosis[`Description_${language}`]}
                            showChevron={false}
                        />
                    ))}
                </Stack>
            </>
        )
    });

    return (
        <>
            {rows}
        </>
    );
}
