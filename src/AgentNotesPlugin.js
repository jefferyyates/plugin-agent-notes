import React from 'react';
import { FlexPlugin, loadCSS } from 'flex-plugin';

import AgentNotes from './components/AgentNotes';

const PLUGIN_NAME = 'AgentNotesPlugin';

export default class AgentNotesPlugin extends FlexPlugin {
  constructor() {
    super(PLUGIN_NAME);
  }

  /**
   * This code is run when your plugin is being started
   * Use this to modify any UI components or attach to the actions framework
   *
   * @param flex { typeof import('@twilio/flex-ui') }
   * @param manager { import('@twilio/flex-ui').Manager }
   */
  init(flex, manager) {
    loadCSS('https://rose-gaur-9610.twil.io/assets/styles.css');

    flex.TaskCanvasTabs.Content.add(
        <AgentNotes label="Notes" icon="Directory" iconActive="DirectoryBold" key="agent-notes" />
    );

    manager.workerClient.on("reservationCreated", reservation => {
      //Register listener for reservation wrapup event
      reservation.on('wrapup', async (reservation) => {
        const agentNotes = localStorage.getItem('agentNotes');
        
        console.log("From here, write the localStorage notes to an API or other destination");
        console.log(agentNotes);

        // You have access to reservation.task, so task.attributes is available.
        let newAttributes = { ...reservation.task.attributes };
        newAttributes.agentNotes = agentNotes;

        // Insights can "see" conversations info
        let conversations = reservation.task.attributes.conversations;
        let newConversations = {};
        if(conversations) newConversations = { ...conversations };
        newConversations.agentNotes = agentNotes;
        newAttributes.conversations = newConversations;

        // Always "await" as we need to avoid race conditions
        await reservation.task.setAttributes(newAttributes);

        // Whatever you do with it, wipe it for next time.
        localStorage.setItem('agentNotes', '');
      });

    });

  }
}
