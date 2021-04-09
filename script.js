// function initMap() {
    // map = new google.maps.Map(document.getElementById('map'), {
    //     center: {lat: 10.7683, lng: 122.5847},
    //     zoom: 15,
    //     mapId: 'b7b87ae2ae5f9ca2'
    // });lat: 10.7683, lng: 122.5847
// }

// This example requires the Visualization library. Include the libraries=visualization
// parameter when you first load the API. For example:
let map, heatmap;

async function initMap() {
  const points = await getPoints();
  const locations = points.map(point => changeCoordSystem(point));
  console.log(locations);
  // locations = [{ lat: 10.2959051, lng: 123.8876657 }]
  map = new google.maps.Map(document.getElementById("map"), {
    zoom: 13,
    center: { lat: 10.7683, lng: 122.5847 },
    mapTypeId: "satellite",
  });
  heatmap = new google.maps.visualization.HeatmapLayer({
    data: points,
    map: map,
  });
  const labels = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  // Add some markers to the map.
  // Note: The code uses the JavaScript Array.prototype.map() method to
  // create an array of markers based on a given "locations" array.
  // The map() method here has nothing to do with the Google Maps API.
  const markers = locations.map((location, i) => {
    return new google.maps.Marker({
      position: location,
      label: labels[i % labels.length],
    });
  });
  // Add a marker clusterer to manage the markers.
  new MarkerClusterer(map, markers, {
    imagePath:
      "https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m",
  });
}

function toggleHeatmap() {
  heatmap.setMap(heatmap.getMap() ? null : map);
}

function changeCoordSystem(coord) {
  x = coord.location.lat();
  y = coord.location.lng();
  return { lat: x, lng: y };
}

function changeGradient() {
  const gradient = [
    "rgba(0, 255, 255, 0)",
    "rgba(0, 255, 255, 1)",
    "rgba(0, 191, 255, 1)",
    "rgba(0, 127, 255, 1)",
    "rgba(0, 63, 255, 1)",
    "rgba(0, 0, 255, 1)",
    "rgba(0, 0, 223, 1)",
    "rgba(0, 0, 191, 1)",
    "rgba(0, 0, 159, 1)",
    "rgba(0, 0, 127, 1)",
    "rgba(63, 0, 91, 1)",
    "rgba(127, 0, 63, 1)",
    "rgba(191, 0, 31, 1)",
    "rgba(255, 0, 0, 1)",
  ];
  heatmap.set("gradient", heatmap.get("gradient") ? null : gradient);
}

function changeRadius() {
  heatmap.set("radius", heatmap.get("radius") ? null : 20);
}

function changeOpacity() {
  heatmap.set("opacity", heatmap.get("opacity") ? null : 0.2);
}

async function getCoordinates(hospital) {
  try {
    let coords;
    const hospitalFormatted = hospital.replace(/\s+/g, '+');
    const response = await axios.get(`https://maps.googleapis.com/maps/api/geocode/json?address=${hospitalFormatted}&key=AIzaSyAM6jhOavWO5VBALwH3ObDXz7DT1S82m24`);
    if (response.status === 200) { 
      const x = response.data.results[0].geometry.location.lat;
      const y = response.data.results[0].geometry.location.lng;
      const coords = {location: new google.maps.LatLng(x, y), weight: 5};
      console.log(x, y);
      return coords;
    }
    return coords;
  } catch (err) {
    console.log(err);
  }
}

const getHospitals = async () => {
  try {
    const response = await axios.get('https://covid19-api-philippines.herokuapp.com/api/list-of/hospitals?dataset=facilities_information');
    if (response.status === 200) { 

      return response.data.data.map(obj => obj.name).slice(1, 10);
    }
  } catch (err) {
    console.log(err)
  }
}

const getPoints = async () => {
  const hospitals = await getHospitals();
  let coodinateList = [];
  for (let i = 0; i < hospitals.length; i++) {
    const coords = await getCoordinates(hospitals[i]);
    coodinateList.push(coords);
  }
  console.log(coodinateList);
  return coodinateList;
}