// SPDX-FileCopyrightText: Copyright (C) 2025 Opal Health Informatics Group at the Research Institute of the McGill University Health Centre <john.kildea@mcgill.ca>
//
// SPDX-License-Identifier: Apache-2.0

import React from 'react';
import { useEffect, useState } from 'react';

import { List, ListDateHeader, ListItem } from './list/List.js';
import { ListUtility } from '../models/utility/lists.js';

export default function TreatingTeamMessages({ treatingTeamMessagesService, updateUIService }) {
    let treatingTeamMessages = [];
    const [treatingTeamMessagesByDate, setTreatingTeamMessagesByDate] = useState({});

    useEffect(() => {
        async function getData() {
            // Call to get Treating Team Messages
            await updateUIService.getData('TxTeamMessages');
            console.log('Call to get TxTeamMessages');
            treatingTeamMessages = treatingTeamMessagesService.getTxTeamMessages();
            display();
        }
        getData();
        return () => {};
    }, []);

    function display() {
        treatingTeamMessagesService.setLanguageTxTeamMessages(treatingTeamMessagesService.getTxTeamMessages());

        // Group treating team messages together by date before displaying
        setTreatingTeamMessagesByDate(ListUtility.groupByDate(treatingTeamMessages, 'DateAdded'));
    }

    const rows = Object.entries(treatingTeamMessagesByDate).map(entry => {
        const [dateString, values] = entry;

        return (
            <>
                {/* DATE HEADER */}
                <ListDateHeader date={values[0].DateAdded} />
                <List>
                    {/* LIST OF TREATING TEAM MESSAGES */}
                    {values.map(message => (
                        <ListItem
                            key={message.TxTeamMessageSerNum}
                            iconClasses="fa-solid fa-user-md fa14x"
                            iconColor={'#2196F3'}
                            text={message[`Title`]}
                            showChevron={true}
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
