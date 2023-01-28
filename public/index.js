// Description: This file contains the code for the web page that displays the vessels and their data

const body = document.getElementsByTagName("body")[0];

function buildTable(data) {
  const table = document.createElement("table");
  table.setAttribute("id","table")
  table.setAttribute("class", "table table-hover table-responsive-sm table-striped table-bordered")
  table.innerHTML = `<thead><tr><th>Field</th><th>Value</th><th>Units</th></tr></thead>`;

  const tbody = document.createElement("tbody");

  function buildRow(data, parentKey = "") {
    for (const key in data) {
      if (
          key !== "meta" &&
          key !== "$source" &&
          key !== "timestamp" &&
          key !== "units" &&
          key !== "description" &&
          key !== "sentence" &&
          key !== "notifications"
      ) {
        if (typeof data[key] === "object") {
          buildRow(data[key], parentKey + key + " > ");
        } else {
          let field = parentKey + key;
          field = field.replace("> value", "");
          let value = data[key];
          let units = "";

          if (data.hasOwnProperty("meta") && data.meta.hasOwnProperty("units")) {
            units = data.meta.units;
          }
          if(!isNaN(value)) {
            value = parseFloat(value).toFixed(3);
          }
          const row = `<tr><td>${field}</td><td>${value}</td><td>${units}</td></tr>`;
          tbody.innerHTML += row;
        }
      }
    }
  }
  buildRow(data);
  table.appendChild(tbody);
  return table;
}



// fetching the data from a signalk server
// TODO: change the host name for production
fetch("http://localhost:3001/signalk/v1/api/vessels")
  .then((response) => response.json())
  .catch((error) => {
    console.log(error);
  })
  .then((vesselsData) => {
    generateGraphView(vesselsData);
  });
