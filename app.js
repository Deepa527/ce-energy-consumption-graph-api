const consumptionData = require('./consumptions.json');

exports.handler = async (event) => {
    const corsHeaders = {
        "Access-Control-Allow-Origin": "*",
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

    // Date bounds
    const minDate = new Date('2022-01-01');
    const maxDate = new Date('2025-06-01');

    // Individual date validation
    if (from < minDate || from > maxDate) {
        return {
            statusCode: 400,
            headers: corsHeaders,
            body: JSON.stringify({
                message: "'fromDate' must be between 2022-01-01 and 2025-06-01."
            })
        };
    }

    if (to < minDate) {
        return {
            statusCode: 400,
            headers: corsHeaders,
            body: JSON.stringify({
                message: "'toDate' must be between 2022-01-01 and 2025-06-01."
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
