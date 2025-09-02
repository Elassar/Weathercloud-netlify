// netlify/functions/meteo.js

export async function handler(event, context) {
  // CORS base
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*", // ← sostituisci con il tuo dominio per restringere
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
    const stationId = process.env.STATION_ID; // Impostala su Netlify → Site settings → Environment variables
    if (!stationId) {
      return {
        statusCode: 500,
        headers: corsHeaders,
        body: JSON.stringify({ error: "STATION_ID mancante nelle variabili d'ambiente" })
      };
    }

    // import dinamico per compatibilità in funzione serverless
    const { getWeather } = await import("weathercloud-js");
    const data = await getWeather(stationId);

    return {
      statusCode: 200,
      headers: {
        ...corsHeaders,
        // Cache CDN Netlify (5 minuti) + SWR
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=60"
      },
      body: JSON.stringify({ ok: true, stationId, data })
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ ok: false, error: String(err?.message || err) })
    };
  }
}
