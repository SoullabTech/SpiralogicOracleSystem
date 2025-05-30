import axios from 'axios';
export async function prefectTriggerFlow(flowName, payload) {
    try {
        const response = await axios.post('https://api.prefect.io', {
            flow_name: flowName,
            payload: payload,
        });
        return response.data;
    }
    catch (error) {
        console.error("Failed to trigger Prefect flow:", error);
        throw error;
    }
}
