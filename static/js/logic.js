//urls for data
let url = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_month.geojson'
let urlplate = 'PB2002_boundaries.json';

//set color for depth
function getcolor(depth) {
    if (depth > 89) return '#caf4cb';
    if (depth > 69) return '#82ec84';
    if (depth > 49) return '#2c7c56';
    if (depth > 29) return '#144163';
    if (depth > 9) return '#302769';
    else return '#000000';
}
//plate and earthquake data
Promise.all([
    d3.json(url),
    d3.json(urlplate)
]).then(function([earthquakeData, plateData]) {

    //Add markers and their popups
    let markerGroup = L.geoJSON(earthquakeData, {
        pointToLayer: function(feature, latlng) {
            let markerColor = feature.geometry.coordinates[2]; //to get the depth
            let markerSize = feature.properties.mag * 5;
            let popupContent = `
            <b>Magnitude:</b> ${feature.properties.mag}<br>
            <b>Time:</b> ${new Date(feature.properties.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}<br>
            <b>Place:</b> ${feature.properties.place}<br>
            <b>Depth:</b> ${feature.geometry.coordinates[2]}<br>`;
            let marker = L.circleMarker(latlng, {
                radius: markerSize,
                fillColor: getcolor(markerColor),
                color: '#000000',
                weight: 1,
                opacity: 0.7,
                fillOpacity: 0.5,
                stroke: true,
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
        layers: [markerGroup, satellite]
    });

    //add controls to the map
    L.control.layers(baseMaps, overlayMaps, {
        collapsed: true
    }).addTo(myMap);

    //color displays for the legend
    const colors = {
        '#caf4cb': '90+',
        '#82ec84': '70 - 89',
        '#2c7c56': '50 - 69',
        '#144163': '30 - 49',
        '#302769': '10 - 29',
        '#000000': '-10 - 10'
    };

    //add legend to map
    let legend = L.control({
        position: 'bottomright'
    });
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