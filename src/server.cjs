const express = require('express');
const cors = require('cors');
const { Client } = require('pg');

const app = express();
app.use(cors()); 

const client = new Client({
    user: 'postgres',
    host: 'localhost',
    database: 'history_map',
    password: 'adminadmin',
    port: 5432,
});
client.connect();

app.get('/api/borders', async (req, res) => {
    const year = parseInt(req.query.year) || 1914; 
    
    try {
        const result = await client.query(`
            SELECT 
                country_name, 
                ST_AsGeoJSON(geom)::json AS geometry,
                --Middle for country name
                ST_AsGeoJSON(ST_PointOnSurface(geom))::json AS centroid
            FROM historical_borders
            WHERE $1 >= start_year AND $1 <= end_year
            AND ST_Intersects(geom, ST_MakeEnvelope(-15.0, 34.0, 45.0, 72.0, 4326))
        `, [year]);

        const features = [];
        
        result.rows.forEach(row => {
            features.push({
                type: "Feature",
                properties: { name: row.country_name, type: 'border' },
                geometry: row.geometry
            });
            
            features.push({
                type: "Feature",
                properties: { name: row.country_name, type: 'label' },
                geometry: row.centroid
            });
        });

        res.json({ type: "FeatureCollection", features });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/years', async (req, res) => {
    try {
        const result = await client.query('SELECT DISTINCT start_year AS year FROM historical_borders ORDER BY year ASC');
        res.json(result.rows.map(row => row.year));
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/timerange', async (req, res) => {
    try {
        const result = await client.query('SELECT MIN(start_year) as min_year, MAX(end_year) as max_year FROM historical_borders');
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.listen(3001, () => {
    console.log('Az API fut: http://localhost:3001');
});