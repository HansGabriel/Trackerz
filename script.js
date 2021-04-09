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
  const coordPoints = points[0];
  const names = points[1];
  const casesList = points[2];

  const locations = coordPoints.map(point => changeCoordSystem(point));

  map = new google.maps.Map(document.getElementById("map"), {
    zoom: 13,
    center: { lat: 10.7683, lng: 122.5847 },
    mapTypeId: "satellite",
  });
  heatmap = new google.maps.visualization.HeatmapLayer({
    data: coordPoints,
    map: map,
  });

  for (let i = 0; i < locations.length; i++) {
    const coords = locations[i];

    const marker = new google.maps.Marker({
        position: coords,
        map,
        title: "Hospital",
        icon: {
            url: "assets/hospital.svg",
            scaledSize: new google.maps.Size(38, 31)
        },
        animation: google.maps.Animation.DROP,
    });

    const contentString = formatInfoCard(capitalizeWords(names[i]), casesList[i])

    const infowindow = new google.maps.InfoWindow({
        content: contentString
    });

    marker.addListener("click", () => {
        infowindow.open(map, marker);
    });
  }
}









// Helper Functions


function toggleHeatmap() {
  heatmap.setMap(heatmap.getMap() ? null : map);
}

function changeCoordSystem(coord) {
  x = coord.lat();
  y = coord.lng();
  return { lat: x, lng: y };
}

function formatInfoCard(title, content) {
  const contentString =
  '<div id="content">' +
  '<div id="siteNotice">' +
  "</div>" +
  `<h1 id="firstHeading" class="firstHeading">${title}</h1>` + 
  '<div id="bodyContent">' +
  `<span class="captain"> <b>Covid Cases: </b> ${content} </span> ` + 
  "</div>" +
  "</div>";
  return contentString;
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

function capitalizeWords(mySentence) {
  const words = mySentence.split(" ");

  for (let i = 0; i < words.length; i++) {
      words[i] = words[i][0].toUpperCase() + words[i].substr(1);
  }

  const res = words.join(" ");

  return res;

}











// API Functions

async function getCoordinates(hospital) {
  try {
    let coords;
    const hospitalFormatted = hospital.replace(/\s+/g, '+');
    const response = await axios.get(`https://maps.googleapis.com/maps/api/geocode/json?address=${hospitalFormatted}&key=AIzaSyAM6jhOavWO5VBALwH3ObDXz7DT1S82m24`);
    if (response.status === 200) { 
      const x = response.data.results[0].geometry.location.lat;
      const y = response.data.results[0].geometry.location.lng;
      const coords = new google.maps.LatLng(x, y);
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

const getCovidCasesInHospital = async (hospital) => {
  try {
    const formattedHospital = hospital.replace(/\s+/g, '%20');
    const response = await axios.get(`https://covid19-api-philippines.herokuapp.com/api/facilities/summary?hospital_name=${formattedHospital}`);
    if (response.status === 200) { 
      const covidDetails =  response.data.data.beds.covid;
      const numCovidCases = covidDetails.icu_o + covidDetails.isolbed_o + covidDetails.beds_ward_o;

      return numCovidCases;
    }
  } catch (err) {
    console.log(err)
  }
}

const getPoints = async () => {
  const hospitals = await getHospitals();
  let coodinateList = [];
  let casesList = [];
  for (let i = 0; i < hospitals.length; i++) {
    const coords = await getCoordinates(hospitals[i]);
    const number = await getCovidCasesInHospital(hospitals[i]);
    coodinateList.push(coords);
    casesList.push(number);
  }
  return [coodinateList, hospitals, casesList];
}