/* eslint-disable no-prototype-builtins */
// Description: This file contains the code for the web page that displays the vessels and their data
/* eslint-disable no-undef */

const body = document.getElementsByTagName("body")[0];

function buildTable(data) {
  const table = document.createElement("table");
  table.setAttribute("id","table")
  table.setAttribute("class", "table table-hover table-responsive-sm table-striped table-bordered");
  var thead = document.createElement("thead");
  var trow = document.createElement("tr");
  var th1 = document.createElement("th");
  var th2 = document.createElement("th");
  th1.innerHTML = "Field";
  th2.innerHTML = "Value";
  trow.appendChild(th1);
  trow.appendChild(th2);
  thead.appendChild(trow);
  table.appendChild(thead);

  var tbody = document.createElement("tbody");

  function buildRow(data, parentKey = "") {
    for (var key in data) {
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
          var trow = document.createElement("tr");
          var td1 = document.createElement("td");
          var td2 = document.createElement("td");
          if (parentKey === key) {
            td1.innerHTML = parentKey.replace("value", "");
          } else {
            var string = parentKey + key;
            td1.innerHTML = string.replace("> value", "");
          }

          trow.appendChild(td1);
          trow.appendChild(td2);
          if (data.hasOwnProperty("meta") && data.meta.hasOwnProperty("units")) {
            // check if the value is a number, if true approximate it with 3 digits

              const value = parseFloat(data[key])
              td2.innerHTML = value.toFixed(3);
              td2.innerHTML += " " + data.meta.units;

          } else {
            td2.innerHTML = data[key]
          }
          tbody.appendChild(trow);
        }
      }
    }
  }
  buildRow(data);
  table.appendChild(tbody);
  return table;
}

// fetching the data from a signalk server
fetch("http://localhost:3001/signalk/v1/api/vessels")
  .then((response) => response.json())
  .catch((error) => {
    console.log(error);
  })
  .then((vesselsData) => {
    generateGraphView(vesselsData);
  });
