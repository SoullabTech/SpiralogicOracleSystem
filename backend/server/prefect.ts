// oracle-backend/server/tasks/prefect.ts

import axios from "axios";

const PREFECT_API_URL = process.env.PREFECT_API_URL!;
const PREFECT_API_KEY = process.env.PREFECT_API_KEY!;

interface TriggerJournalProcessingArgs {
  user_id: string;
  entry_text: string;
}

export async function triggerDailyJournalProcessing({
  user_id,
  entry_text,
}: TriggerJournalProcessingArgs): Promise<{ status: string; run_id?: string }> {
  try {
    const response = await axios.post(
      PREFECT_API_URL,
      {
        parameters: {
          user_id,
          entry_text,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${PREFECT_API_KEY}`,
          "Content-Type": "application/json",
        },
      },
    );

    if (response.status === 200 || response.status === 201) {
      return {
        status: "success",
        run_id: response.data.id,
      };
    }

    return {
      status: "error",
    };
  } catch (err) {
    console.error("Error triggering Prefect flow:", err);
    return {
      status: "error",
    };
  }
}
