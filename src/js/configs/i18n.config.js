import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import enTopLevel from '../../Languages/appTranslationTablesViews/top-view/en.json';
import frTopLevel from '../../Languages/appTranslationTablesViews/top-view/fr.json';

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
                translation: enTopLevel,
            },
            fr: {
                translation: frTopLevel,
            },
        }
    });

export default i18n;
