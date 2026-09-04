const fs = require('fs');
const { Client } = require('pg');

const client = new Client({
    user: 'postgres',
    host: 'localhost',
    database: 'history_map',
    password: 'adminadmin',
    port: 5432,
});

async function importCShapes() {
    await client.connect();
    
    await client.query(`
        CREATE EXTENSION IF NOT EXISTS postgis;
        DROP TABLE IF EXISTS historical_borders;
        CREATE TABLE historical_borders (
            id SERIAL PRIMARY KEY,
            start_year INTEGER,
            end_year INTEGER,
            country_name VARCHAR(255),
            geom GEOMETRY(Geometry, 4326)
        );
    `);

    const rawData = fs.readFileSync('CShapes-Europe.geojson');
    const geojson = JSON.parse(rawData);

    let count = 0;
    for (const feature of geojson.features) {
        const countryName = feature.properties.Name;
        const startYear = feature.properties.From;
        const endYear = feature.properties.To;
        const geometryStr = JSON.stringify(feature.geometry);

        await client.query(`
            INSERT INTO historical_borders (start_year, end_year, country_name, geom)
            VALUES ($1, $2, $3, ST_SetSRID(ST_GeomFromGeoJSON($4), 4326))
        `, [startYear, endYear, countryName, geometryStr]);
        count++;
    }
    
    console.log(`${count} történelmi országhatár betöltve a CShapes-ből!`);
    await client.end();
}

importCShapes();