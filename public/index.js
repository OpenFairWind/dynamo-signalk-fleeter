/* eslint-disable no-prototype-builtins */
// Description: This file contains the code for the web page that displays the vessels and their data
/* eslint-disable no-undef */

var body = document.getElementsByTagName("body")[0];

function createCard(vessel) {
  // Create a new div element to hold the card
  const card = document.createElement("div");
  card.classList.add("card", "mb-4");

  // Create a container div for the card content
  const cardContainer = document.createElement("container");
  cardContainer.classList.add("column", "no-gutters");

  // Create an image element for the card
  const img = document.createElement("img");
  img.classList.add("card-img", "col-md-4", "mx-auto");
  img.style.display = "block";
  img.style.marginLeft = "auto";
  img.style.marginRight = "auto";
  img.style.width = "50%";
  img.src = "https://icons.veryicon.com/png/o/miscellaneous/daily-series-linearity/ship-26.png";

  // Create a div element for the card body
  const cardBody = document.createElement("div");
  cardBody.classList.add(
    "card-body",
    "column-md-8",
    "d-flex",
    "flex-column",
    "align-items-center",
    "justify-content-center"
  );

  // Create a header element for the card
  const cardHeader = document.createElement("h4");
  cardHeader.classList.add("card-title");
  cardHeader.textContent = vessel.name;

  // Create a table element
  const table = buildTable(vessel);
  table.classList.add("table", "d-none");

  // Create a button element to toggle the table visibility
  const toggleButton = document.createElement("button");
  toggleButton.classList.add("btn", "btn-ghost");
  toggleButton.textContent = "Toggle Table";

  // Add a click event to the button to toggle the visibility of the table
  toggleButton.addEventListener("click", () => {
    table.classList.toggle("d-none");
    img.classList.toggle("d-none");
  });

  // Append the image, header, table and button to the card body
  cardBody.appendChild(cardHeader);
  cardBody.appendChild(toggleButton);
  cardBody.appendChild(table);

  // Append the image and card body to the card container
  cardContainer.appendChild(img);
  cardContainer.appendChild(cardBody);

  // Append the card container to the card
  card.appendChild(cardContainer);

  // Return the created card element
  return card;
}

function buildTable(data) {
  var table = document.createElement("table");
  table.setAttribute("class", "table table-hover table-responsive-sm table-striped table-bordered");
  var thead = document.createElement("thead");
  var trow = document.createElement("tr");
  var th1 = document.createElement("th");
  var th2 = document.createElement("th");
  th1.innerHTML = "Path";
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
          td2.innerHTML = data[key];
          trow.appendChild(td1);
          trow.appendChild(td2);
          if (data.hasOwnProperty("meta") && data.meta.hasOwnProperty("units")) {
            td2.innerHTML += " " + data.meta.units;
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
    const row = document.getElementById("row");
    row.classList.toggle("d-none")
    Object.entries(vesselsData).forEach((vessel) => {
      console.log(vessel[1].name);
      var card = createCard(vessel[1]);
      card.classList.add("col-md-6");
      row.appendChild(card);
    });
  });
