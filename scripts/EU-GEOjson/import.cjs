const fs = require('fs');
const { Client } = require('pg');

const client = new Client({
    user: 'postgres',
    host: 'localhost',
    database: 'history_map',
    password: 'adminadmin',
    port: 5432,
});

const oldFiles = [
    { filename: 'europe_1800.geojson', startYear: 1800, endYear: 1800 },
    { filename: 'europe_1815.geojson', startYear: 1815, endYear: 1815 }
];

async function importOldMaps() {
    await client.connect();

    for (const fileData of oldFiles) {
        if (!fs.existsSync(fileData.filename)) {
            console.log(`Nem található a fájl: ${fileData.filename}`);
            continue;
        }

        const rawData = fs.readFileSync(fileData.filename);
        const geojson = JSON.parse(rawData);
        let count = 0;

        for (const feature of geojson.features) {
            const countryName = feature.properties.NAME || feature.properties.name;
            const geometryStr = JSON.stringify(feature.geometry);

            await client.query(`
                INSERT INTO historical_borders (start_year, end_year, country_name, geom)
                VALUES ($1, $2, $3, ST_SetSRID(ST_GeomFromGeoJSON($4), 4326))
            `, [fileData.startYear, fileData.endYear, countryName, geometryStr]);
            
            count++;
        }
        console.log(`${fileData.filename}: ${count} ország hozzáadva az adatbázishoz!`);
    }

    await client.end();
}

importOldMaps();