/*--------------------------------------------------------------------
ConnectTO Suitability Tool
JavaScript
--------------------------------------------------------------------*/

// Initialize map
const map = new maplibregl.Map({
    container: 'map',
    style: 'https://api.maptiler.com/maps/openstreetmap/style.json?key=vYYUHMMF2krizlVhi9JA',
    center: [-79.355, 43.715],
    zoom: 10.3,
    maxBounds: [
        [-180, 30],
        [-25, 84]
    ],
    bearing: -17,
});

var mq = window.matchMedia("(min-width: 420px)");

if (mq.matches) {
    map.setZoom(10.3);
} else {
    map.setZoom(8.5);
}

map.addControl(new maplibregl.NavigationControl());

/*--------------------------------------------------------------------
DATA
--------------------------------------------------------------------*/

let parks;
let ttcShelter;
let wayfinder;
let neighb;
let suitability;

Promise.all([
    fetch('https://raw.githubusercontent.com/emily-sakaguchi/ConnectTO_v1/main/data/parksNeighb.geojson'),
    fetch('https://raw.githubusercontent.com/emily-sakaguchi/ConnectTO_v1/main/data/ttcNeighb.geojson'),
    fetch('https://raw.githubusercontent.com/emily-sakaguchi/ConnectTO_v1/main/data/wayfindNeighb.geojson'),
    fetch('https://raw.githubusercontent.com/emily-sakaguchi/ConnectTO_v1/main/data/Neighbourhoods.geojson'),
    fetch('https://raw.githubusercontent.com/emily-sakaguchi/ConnectTO_v1/main/data/Suitability.geojson')
])
    .then(responses => Promise.all(responses.map(response => response.json())))
    .then(data => {
        [parks, ttcShelter, wayfinder, neighb, suitability] = data;

        // Adding layers to map
        map.on('load', () => {
            map.addSource('parks', { type: 'geojson', data: parks });
            map.addSource('ttcShelter', { type: 'geojson', data: ttcShelter });
            map.addSource('wayfinder', { type: 'geojson', data: wayfinder });
            map.addSource('neighb', { type: 'geojson', data: neighb });
            map.addSource('suitability', { type: 'geojson', data: suitability });

            map.addLayer({
                'id': 'parks',
                'type': 'circle',
                'source': 'parks',
                'paint': {
                    'circle-radius': ['interpolate', ['linear'], ['zoom'], 9, 1, 10.3, 2, 12, 3.5, 15, 4.5],
                    'circle-color': '#01470a',
                    'circle-stroke-color': 'white',
                    'circle-stroke-width': 1
                }
            });

            map.addLayer({
                'id': 'ttcShelter',
                'type': 'circle',
                'source': 'ttcShelter',
                'paint': {
                    'circle-radius': ['interpolate', ['linear'], ['zoom'], 9, 1, 10.3, 2, 12, 3.5, 15, 4.5],
                    'circle-color': '#ed2f2f',
                    'circle-stroke-color': 'white',
                    'circle-stroke-width': 1
                }
            });

            map.addLayer({
                'id': 'wayfinder',
                'type': 'circle',
                'source': 'wayfinder',
                'paint': {
                    'circle-radius': ['interpolate', ['linear'], ['zoom'], 9, 1, 10.3, 2, 12, 3.5, 15, 4.5],
                    'circle-color': '#066ad4',
                    'circle-stroke-color': 'white',
                    'circle-stroke-width': 1
                }
            });

            map.addLayer({
                'id': 'neighb',
                'type': 'fill',
                'source': 'neighb',
                'paint': {
                    'fill-color': 'transparent',
                    'fill-opacity': 0.8,
                    'fill-outline-color': 'black'
                }
            });

            map.addLayer({
                'id': 'suitability',
                'type': 'fill',
                'source': 'suitability',
                'paint': {
                    'fill-color': [
                        'step',
                        ['get', 'V'],
                        'grey',
                        1, '#a50126', 2, '#da362a',
                        3, '#f57b4a', 4, '#fdbe6f',
                        5, '#feeea1', 6, '#eaf6a2',
                        7, '#b7e175', 8, '#74c465',
                        9, '#229c53', 10, '#006837'
                    ],
                    'fill-opacity': 0.9
                }
            }, 'parks', 'ttcShelter', 'wayfinder');

            map.addLayer({
                'id': 'suitability-hov',
                'type': 'fill',
                'source': 'suitability',
                'paint': {
                    'fill-color': [
                        'step',
                        ['get', 'V'],
                        'grey',
                        1, '#a50126', 2, '#da362a',
                        3, '#f57b4a', 4, '#fdbe6f',
                        5, '#feeea1', 6, '#eaf6a2',
                        7, '#b7e175', 8, '#74c465',
                        9, '#229c53', 10, '#006837'
                    ],
                    'fill-outline-color': 'white',
                    'fill-opacity': 1
                },
                'filter': ['==', ['get', 'S_Id'], '']
            }, 'parks', 'ttcShelter', 'wayfinder');

            // Collapse Menu
            var coll = document.getElementsByClassName("collapsible");
            var i;
            for (i = 0; i < coll.length; i++) {
                coll[i].addEventListener("click", function () {
                    this.classList.toggle("active-collapse");
                    var content = this.nextElementSibling;
                    if (content.style.display === "block") {
                        content.style.display = "none";
                    } else {
                        content.style.display = "block";
                    }
                });
            }

            // Filter Checkboxes
            document.getElementById('parksCheck').addEventListener('change', (e) => {
                map.setLayoutProperty('parks', 'visibility', e.target.checked ? 'visible' : 'none');
            });

            document.getElementById('ttcShelterCheck').addEventListener('change', (e) => {
                map.setLayoutProperty('ttcShelter', 'visibility', e.target.checked ? 'visible' : 'none');
            });

            document.getElementById('wayfinderCheck').addEventListener('change', (e) => {
                map.setLayoutProperty('wayfinder', 'visibility', e.target.checked ? 'visible' : 'none');
            });

            document.getElementById('neighbCheck').addEventListener('change', (e) => {
                map.setLayoutProperty('neighb', 'visibility', e.target.checked ? 'visible' : 'none');
            });

            let legendCheck = document.getElementById('legendCheck');

            legendCheck.addEventListener('click', () => {
                if (legendCheck.checked) {
                    legendCheck.checked = true;
                    suitabilityLegend.style.display = 'block';
                } else {
                    suitabilityLegend.style.display = "none";
                    legendCheck.checked = false;
                }
            });

            // Return Button
            document.getElementById('returnbutton').addEventListener('click', () => {
                map.flyTo({
                    center: [-79.355, 43.715],
                    essential: true,
                    bearing: -17,
                });
                if (mq.matches) {
                    map.setZoom(10.3);
                } else {
                    map.setZoom(8.5);
                }
            });

            // Click Event Handler for Suitability Layer
            map.on('click', 'suitability', (e) => {
                const selectedS_Id = e.features[0].properties.S_Id;
                console.log(selectedS_Id);

                // Filter parks, ttcShelters, and wayfinders based on selected S_Id
                const filteredParks = parks.features.filter(park => park.properties.S_Id === selectedS_Id);
                const filteredTtcShelters = ttcShelter.features.filter(shelter => shelter.properties.S_Id === selectedS_Id);
                const filteredWayfinders = wayfinder.features.filter(wayfinder => wayfinder.properties.S_Id === selectedS_Id);

                // Combine all filtered features into a single array
                const filteredFeatures = [...filteredParks, ...filteredTtcShelters, ...filteredWayfinders];

                // Clear existing output
                document.getElementById('output').innerHTML = '';

                // Generate new output
                filteredFeatures.forEach(feature => {
                    const name = feature.properties.ASSET_NAME || feature.properties.Name;
                    const type = feature.properties.Type;

                    // Create list item for each feature
                    const listItem = document.createElement('li');
                    listItem.textContent = `${type}: ${name}`;
                    document.getElementById('output').appendChild(listItem);
                });
            });

            // Hover Event Handler for Suitability Layer
            map.on('mousemove', 'suitability', (e) => {
                if (e.features.length > 0) {
                    map.setFilter('suitability-hov', ['==', ['get', 'S_Id'], e.features[0].properties.S_Id]);
                }
            });

            map.on('mouseleave', 'suitability-hov', () => {
                map.setFilter("suitability-hov", ['==', ['get', 'S_Id'], '']);
            });

            // Pop-up Event Handlers
            map.on('mouseenter', 'suitability', () => {
                map.getCanvas().style.cursor = 'pointer';
            });

            map.on('mouseleave', 'suitability', () => {
                map.getCanvas().style.cursor = '';
            });

            map.on('click', 'suitability', (e) => {
                new maplibregl.Popup()
                    .setLngLat(e.lngLat)
                    .setHTML("<b>Suitability score:</b> " + e.features[0].properties.V)
                    .addTo(map);
            });

            map.on('click', 'neighb', (e) => {
                new maplibregl.Popup()
                    .setLngLat([-79.020, 43.691])
                    .setHTML("<b>Neighbourhood Name:</b> " + e.features[0].properties.AREA_NAME + "<br>" +
                        "<b>Improvement Status:</b> " + e.features[0].properties.CLASSIFICATION)
                    .addTo(map);
            });
        });
    })
    .catch(error => console.error('Error fetching data:', error));
