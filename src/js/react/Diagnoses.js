import React from 'react';
import { useTranslation } from 'react-i18next';

export default function Diagnoses({ diagnoses }) {
    const { t, i18n } = useTranslation();
    const language = i18n.language.toUpperCase();

    // Filter out "N/A" diagnoses
    diagnoses = diagnoses.filter(e => {
        return e[`Description_${language}`].toUpperCase() !== 'N/A';
    });

    const listItems = diagnoses.map(diagnosis => {
        return (
            <li key={diagnosis.DiagnosisSerNum}>
                {`${diagnosis[`Description_${language}`]} (${t('intlDateTime',
                    {
                        val: diagnosis.CreationDate,
                        formatParams: {
                            val: { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' },
                        },
                    }
                )})`}
            </li>
        )
    });

    return (
        <>
            <ul>{listItems}</ul>
        </>
    );
}
