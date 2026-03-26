# SPDX-FileCopyrightText: Copyright (C) 2026 Opal Health Informatics Group at the Research Institute of the McGill University Health Centre <john.kildea@mcgill.ca>
#
# SPDX-License-Identifier: Apache-2.0

import json
import sys
from pathlib import Path

MASTER_LANGUAGE = 'en'
TRANSLATION_ROOT = Path('src/Languages/appTranslationTablesViews')

print(sys.argv)

errors = []

for directory in TRANSLATION_ROOT.glob('*'):
    if directory.is_dir():
        print(f'comparing language files in {directory}...')

        master = json.loads(directory.joinpath(MASTER_LANGUAGE).with_suffix('.json').read_text())

        for language_file in directory.glob('*.json'):
            if language_file.stem != MASTER_LANGUAGE:
                print(f'loading and comparing {language_file.name}...')
                language = json.loads(language_file.read_text())

                missing = master.keys() - language.keys()
                additional = language.keys() - master.keys()
                if missing:
                    errors.append(f'{language_file}: missing keys: {missing}')

                if additional:
                    errors.append(f'{language_file}: additional keys: {additional}')

print('\n')

if len(errors) > 0:
    print('Found errors:\n')
    print('\n'.join(errors))
    sys.exit(1)

print('All language files have the same keys')
