// SPDX-FileCopyrightText: Copyright (C) 2025 Opal Health Informatics Group at the Research Institute of the McGill University Health Centre <john.kildea@mcgill.ca>
//
// SPDX-License-Identifier: Apache-2.0

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import universalLocalizations from '../../Languages/appTranslationTablesViews/localization/all-languages.json';
import enTopLevel from '../../Languages/appTranslationTablesViews/top-view/en.json';
import frTopLevel from '../../Languages/appTranslationTablesViews/top-view/fr.json';

// TODO load later
import enLogin from '../../Languages/appTranslationTablesViews/login/en.json';
import frLogin from '../../Languages/appTranslationTablesViews/login/fr.json';
import enAllViews from '../../Languages/appTranslationTablesViews/all-views/en.json';
import frAllViews from '../../Languages/appTranslationTablesViews/all-views/fr.json';

// See: https://locize.com/blog/react-i18next
i18n
    // Connect the i18n instance to react-i18next
    .use(initReactI18next)
    // Init i18next
    // For all options, see: https://www.i18next.com/overview/configuration-options
    .init({
        // TODO turn off debug option
        debug: true,
        // TODO use the fallback language from the app's env file
        fallbackLng: 'en',
        interpolation: {
            // Not needed for react as it escapes by default
            escapeValue: false,
        },
        resources: {
            en: {
                translation: {
                    ...universalLocalizations,
                    ...enTopLevel,
                    ...enLogin,
                    ...enAllViews,
                },
            },
            fr: {
                translation: {
                    ...universalLocalizations,
                    ...frTopLevel,
                    ...frLogin,
                    ...frAllViews,
                },
            },
        }
    });

export default i18n;
