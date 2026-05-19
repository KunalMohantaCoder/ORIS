--------------------------------------------------
FREE API INPUT SECTION
--------------------------------------------------

[ORBITAL DATA APIs]
PASTE APIs HERE

# Example JSON source using an environment variable in the URL:
# {"name":"NASA Example Feed","url":"https://api.nasa.gov/example?api_key=${NASA_API_KEY}","type":"generic-json","category":"active","limit":500}

# Example JSON source using an environment variable in headers:
# {"name":"Bearer Token Example","url":"https://example.org/free-orbital-data.json","type":"generic-json","headers":{"Authorization":"Bearer ${ORIS_CUSTOM_API_KEY}"},"limit":500}

[SPACE DEBRIS APIs]
# ORIS already includes free CelesTrak debris feeds by default.
# Add only API URLs or JSON source definitions here, not pasted CSV rows.
PASTE APIs HERE

[SATELLITE TRACKING APIs]
PASTE APIs HERE

[EARTH / SPACE VISUALIZATION APIs]
NOAA Planetary K Index=https://services.swpc.noaa.gov/json/planetary_k_index_1m.json
NASA APOD=https://api.nasa.gov/planetary/apod?api_key=${NASA_API_KEY}

[PHYSICS / EDUCATIONAL DATA APIs]
PASTE APIs HERE

[SURVEY / ANALYTICS APIs]
PASTE APIs HERE

--------------------------------------------------
