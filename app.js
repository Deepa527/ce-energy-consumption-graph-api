const consumptionData = require('./consumptions.json');

exports.handler = async (event) => {
    const corsHeaders = {
        "Access-Control-Allow-Origin": "*", // Replace with domain if needed
        "Access-Control-Allow-Headers": "*",
        "Access-Control-Allow-Methods": "POST,OPTIONS"
    };

    // Handle OPTIONS preflight request
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers: corsHeaders,
            body: JSON.stringify({ message: 'CORS preflight handled' })
        };
    }

    const accountId = event.pathParameters?.accountId;
    const body = JSON.parse(event.body || '{}');
    const { fromDate, toDate } = body;

    const username = event.requestContext?.authorizer?.claims?.['cognito:username'] || 'Unknown';
    console.log(`Request made by user: ${username}`);

    const from = new Date(fromDate);
    const to = new Date(toDate);

    if (isNaN(from.getTime()) || isNaN(to.getTime())) {
        return {
            statusCode: 400,
            headers: corsHeaders,
            body: JSON.stringify({
                message: "Invalid or missing 'fromDate' or 'toDate'."
            })
        };
    }

    // Filter based on date range
    const filtered = consumptionData.filter(item => {
        const itemFrom = new Date(item["from-date"]);
        const itemTo = new Date(item["to-date"]);
        return itemTo >= from && itemFrom <= to;
    });

    return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify({
            message: "Filtered energy data retrieved successfully.",
            data: [
                {
                    id: accountId || "unknown",
                    type: "meter-consumptions",
                    attributes: {
                        "billing-type": "MONTHLY",
                        "meter-serial-number": "E6E03598122121",
                        consumptions: filtered
                    }
                }
            ]
        })
    };
};
