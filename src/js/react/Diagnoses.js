import React from 'react';
import { useTranslation } from 'react-i18next';

import { Group, Table, Text } from '@mantine/core';

export default function Diagnoses({ diagnoses }) {
    const { t, i18n } = useTranslation();
    const language = i18n.language.toUpperCase();

    // Filter out "N/A" diagnoses
    diagnoses = diagnoses.filter(e => {
        return e[`Description_${language}`].toUpperCase() !== 'N/A';
    });

    // TODO group diagnoses together by date before displaying

    const rows = diagnoses.map(diagnosis => (
        <Table.Tr key={diagnosis.DiagnosisSerNum}>
            <Table.Td>
                <Group gap="sm">
                    <i className="fa-solid fa-stethoscope fa14x" style={{color: '#994741'}} />
                    <Text fz="md" fw={500}>
                        {diagnosis[`Description_${language}`]}
                    </Text>
                </Group>
            </Table.Td>

            <Table.Td>
                <Text fz="md" fw={500}>
                    {t('intlDateTime', {
                        val: diagnosis.CreationDate,
                        formatParams: {
                            val: { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' },
                        },
                    })}
                </Text>
            </Table.Td>
        </Table.Tr>
    ));

    return (
        <Table.ScrollContainer minWidth={600}>
            <Table verticalSpacing="sm">
                <Table.Thead>
                    <Table.Tr>
                        <Table.Th>{t('DIAGNOSIS')}</Table.Th>
                        <Table.Th>Date</Table.Th>
                    </Table.Tr>
                </Table.Thead>
                <Table.Tbody>{rows}</Table.Tbody>
            </Table>
        </Table.ScrollContainer>
    );
}
