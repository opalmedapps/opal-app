// SPDX-FileCopyrightText: Copyright (C) 2025 Opal Health Informatics Group at the Research Institute of the McGill University Health Centre <john.kildea@mcgill.ca>
//
// SPDX-License-Identifier: Apache-2.0

import React from 'react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { ScrollArea } from '@mantine/core';

import { List, ListDateHeader, ListItem } from './list/List.js';
import { ListUtility } from '../models/utility/lists.js';

export default function Diagnoses({ diagnosesService, updateUIService }) {
    let diagnoses = [];
    const [diagnosesByDate, setDiagnosesByDate] = useState([]);

    const { i18n } = useTranslation();
    const language = i18n.language.toUpperCase();

    useEffect(() => {
        async function getData() {
            // Call to get Diagnoses
            await updateUIService.getData('Diagnosis');
            console.log('Call to get Diagnoses');
            diagnoses = diagnosesService.getDiagnoses();
            display();
        }
        getData();
        return () => {};
    }, []);

    function display() {
        // Filter out "N/A" diagnoses
        diagnoses = diagnoses.filter(e => {
            return e[`Description_${language}`].toUpperCase() !== 'N/A';
        });

        // Group diagnoses together by date before displaying
        setDiagnosesByDate(ListUtility.groupByDate(diagnoses, 'CreationDate'));
    }

    const rows = Object.entries(diagnosesByDate).map(entry => {
        const [dateString, values] = entry;

        return (
            <>
                {/* DATE HEADER */}
                <ListDateHeader date={values[0].CreationDate} />
                <List>
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
                </List>
            </>
        )
    });

    return (
        <>
            {rows}
        </>
    );
}
