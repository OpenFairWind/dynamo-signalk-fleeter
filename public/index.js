const body = document.getElementsByTagName("body")[0];

function buildTable(data) {
  const table = document.createElement("table");
  table.setAttribute("id", "table");
  table.setAttribute("class", "table table-hover table-responsive-sm table-striped table-bordered");
  table.innerHTML = `<thead><tr><th>Field</th><th>Value</th><th>Units</th></tr></thead>`;

  const tbody = document.createElement("tbody");

  function buildRow(data, parentKey = "") {
    for (const key in data) {
      if (
        key !== "meta" &&
        key !== "$source" &&
        key !== "timestamp" &&
        key !== "units" &&
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
          let description = "";

          if (data.hasOwnProperty("meta") && data.meta.hasOwnProperty("description")) {
            description = data.meta.description;
            field = `<span class="CellWithComment">${field}<span class="CellComment">${description}</span></span>`;
          }

          if (data.hasOwnProperty("meta") && data.meta.hasOwnProperty("units")) {
            units = data.meta.units;
          }
          if (!isNaN(value)) {
            value = parseFloat(value).toFixed(3);
          }
          const row = `<tr><td class="CellWithComment">${field}</td><td>${value}</td><td>${units}</td></tr>`;
          tbody.innerHTML += row;
        }
      }
    }
  }
  buildRow(data);
  table.appendChild(tbody);
  return table;
}

// fetching the data from a signal-k server
var link = `http://${window.location.hostname}:${window.location.port}/signalk/v1/api/vessels`;
fetch(link)
  .then((response) => response.json())
  .catch((error) => {
    console.log(error);
    var errorMessage = document.createElement("errorMessage");
    errorMessage.innerHTML = `<h4> Error connecting to the host </h4>`;
    body.appendChild(errorMessage);
  })
  .then((vesselsData) => {
    generateGraphView(vesselsData);
  });
