const fs = require('fs');

const filesToProcess = [
    'world_1880.geojson','world_1800.geojson','world_1815.geojson', 'world_1900.geojson', 'world_1914.geojson', 'world_1920.geojson', 'world_1930.geojson', 'world_1938.geojson', 'world_1945.geojson',
    'world_1960.geojson', 'world_1994.geojson', 'world_2000.geojson', 'world_2010.geojson',
];

const europeCountries = [
    "Luxembourg", "Ottoman Empire", "Spain", "United Kingdom", "United Kingdom of Great Britain and Ireland", "Portugal", "France", "Netherlands",
    "Kingdom of the Two Sicilies", "Palatinate", "Hohenzollern", "Baden", "Saxony", "Prussia", "Mecklenburg-Strelitz", "Grand Duchy of Hesse",
    "Nassau", "Wetzlar", "Lippe-Detmold", "Brunswick", "Anhalt", "Lübeck", "Oldenburg", "Hanover", "Bremen", "Cuxhaven", "Schleswig", "Holstein",
    "Hamburg", "Thuringia", "Austrian Netherlands", "Finnmark", "Iceland", "Belgium", "Mecklenburg-Schwerin", "Electoral Hesse",
    "Switzerland", "Montenegro", "Albania", "Georgia", "Azerbaijan", "Armenia", "Estonia", "Latvia", "Lithuania",
    "Ireland", "Hungary", "Romania", "Bulgaria", "Turkey", "Greece", "Cyprus"
];

filesToProcess.forEach(filename => {
    const rawData = fs.readFileSync(filename);
    const geojson = JSON.parse(rawData);

    geojson.features = geojson.features.filter(feature => {
        const countryName = feature.properties.NAME; 
        return europeCountries.includes(countryName);
    });

    const newFilename = filename.replace('world_', 'europe_');
    
    fs.writeFileSync(newFilename, JSON.stringify(geojson));
    
    console.log(`Successfully processed and saved: ${newFilename}`);
});