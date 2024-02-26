//urls for data
let url = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_month.geojson'
let urlplate = 'static/js/PB2002_boundaries.json';

//set color for depth
function getcolor(depth) {
    if (depth > 89) return '#caf4cb';
    if (depth > 69) return '#82ec84';
    if (depth > 49) return '#2c7c56';
    if (depth > 29) return '#144163';
    if (depth > 9) return '#302769';
    else return 'black';
}
//plate and earthquake data
Promise.all([
    d3.json(url),
    d3.json(urlplate)
]).then(function([earthquakeData, plateData]) {
    console.log(earthquakeData);
    console.log(plateData);

    //design markers and popups for markers
    let markerGroup = L.geoJSON(earthquakeData, {
        pointToLayer: function(feature, latlng) {
            let markerSize = feature.properties.mag * 5;
            let markercolor = feature.geometry.coordinates[2]; //to get the depth, is item 3
            let popupContent = `
            <b>Magnitude:</b> ${feature.properties.mag}<br>
            <b>Time:</b> ${new Date(feature.properties.time).toLocaleString()}
            <b>Place:</b> ${feature.properties.place}<br>
            <b>Depth:</b> ${feature.geometry.coordinates[2]}<br>

        `;
            let marker = L.circleMarker(latlng, {
                radius: markerSize,
                fillColor: getcolor(markercolor),
                color: 'black',
                weight: 2,
                opacity: 0.7,
                fillOpacity: 1
            }).bindPopup(popupContent);

            return marker;
        }
    });

    //start to create and layer map and tiles
    let plateLayer = L.geoJSON(plateData);

    let satellite = L.tileLayer('https://basemap.nationalmap.gov/arcgis/rest/services/USGSImageryTopo/MapServer/tile/{z}/{y}/{x}', {
        maxZoom: 20,
        attribution: 'Tiles from the <a href="https://usgs.gov/">U.S. Geological Survey</a>'
    });

    let street = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    });

    let topo = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    });


    let baseMaps = {
        "Satellite": satellite,
        "Street Map": street,
        "Topographic Map": topo
    };

    let overlayMaps = {
        "Earthquakes": markerGroup,
        "Tectonic Plates": plateLayer
    };

    let myMap = L.map("map", {
        center: [40.00, -100.00],
        zoom: 5,
        layers: [markerGroup,satellite]
    });

    //add controls to the map
    L.control.layers(baseMaps, overlayMaps, {
        collapsed: false
    }).addTo(myMap);

    //color displays for the legend
    const colors = {
        '#caf4cb': '90+',
        '#82ec84': '70 - 89',
        '#2c7c56': '50 - 69',
        '#144163': '30 - 49',
        '#302769': '10 - 29',
        'black': '-10 - 10'
    };

    //add legend to the map
    let legend = L.control({ position: 'bottomright' });
    legend.onAdd = function(map) {
        let div = L.DomUtil.create('div', 'info legend');
        let labels = [];
        for (const color in colors) {
            labels.push(
                '<i style="background:' + color + '"></i> ' +
                colors[color]);
        }
        div.innerHTML = labels.join('<br>');
        return div;
    };
    legend.addTo(myMap);
});