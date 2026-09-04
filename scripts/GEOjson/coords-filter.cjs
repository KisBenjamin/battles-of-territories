const fs = require('fs');
const turf = require('@turf/turf');

const filesToProcess = [
    'world_1880.geojson','world_1800.geojson','world_1815.geojson', 'world_1900.geojson', 'world_1914.geojson', 'world_1920.geojson', 'world_1930.geojson', 'world_1938.geojson', 'world_1945.geojson',
    'world_1960.geojson', 'world_1994.geojson', 'world_2000.geojson', 'world_2010.geojson',
];

const europeBbox = [-15.0, 34.0, 45.0, 72.0];
const europePolygon = turf.bboxPolygon(europeBbox);

filesToProcess.forEach(filename => {
    if (!fs.existsSync(filename)) {
        console.log(`Nem található: ${filename}`);
        return;
    }

    const rawData = fs.readFileSync(filename);
    const geojson = JSON.parse(rawData);

    geojson.features = geojson.features.filter(feature => {
        try {
            return turf.booleanIntersects(feature, europePolygon);
        } catch (error) {
            return false;
        }
    });

    const newFilename = filename.replace('world_', 'europe_');
    fs.writeFileSync(newFilename, JSON.stringify(geojson));
    
    console.log(`Sikeresen kivágva: ${newFilename} (${geojson.features.length} ország maradt)`);
});