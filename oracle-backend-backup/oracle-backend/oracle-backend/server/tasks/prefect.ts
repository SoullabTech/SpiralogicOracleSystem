// oracle-backend/server/tasks/prefect.ts

import axios from 'axios';

export async function triggerPrefectJournalFlow(userId: string, entryText: string) {
  const flowURL = process.env.PREFECT_JOURNAL_FLOW_URL;

  if (!flowURL) {
    throw new Error('PREFECT_JOURNAL_FLOW_URL not defined in environment variables.');
  }

  const response = await axios.post(flowURL, {
    user_id: userId,
    entry_text: entryText,
  });

  return response.data;
}
