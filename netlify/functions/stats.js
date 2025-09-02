// netlify/functions/stats.js

export async function handler(event, context) {
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type"
  };

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers: corsHeaders, body: "" };
  }
  if (event.httpMethod !== "GET") {
    return {
      statusCode: 405,
      headers: corsHeaders,
      body: JSON.stringify({ error: "Metodo non consentito" })
    };
  }

  try {
    const stationId = process.env.STATION_ID;
    if (!stationId) {
      return {
        statusCode: 500,
        headers: corsHeaders,
        body: JSON.stringify({ error: "STATION_ID mancante" })
      };
    }

    const { getStatistics } = await import("weathercloud-js");
    const stats = await getStatistics(stationId);

    return {
      statusCode: 200,
      headers: {
        ...corsHeaders,
        "Cache-Control": "public, s-maxage=900, stale-while-revalidate=120"
      },
      body: JSON.stringify({ ok: true, stationId, stats })
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ ok: false, error: String(err?.message || err) })
    };
  }
}
