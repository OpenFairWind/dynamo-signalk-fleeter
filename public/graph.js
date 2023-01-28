function vesselToGraph(vesselsData) {
  const elements = {}
  elements.nodes = []
  elements.edges = []

  // TODO: remove this nodes
  const testChild = {id: "testChild1",name:"Test Child"}
  const testChild2 = {id: "testChild2",name:"Sec. Test Child"}
  elements.nodes.push ({
    data: testChild
  })

  elements.nodes.push({
    data: testChild2
  })

  // TODO: remove this edges before pulling
  elements.edges.push({
    data: {source: 'urn:mrn:signalk:uuid:parentvessel', target: testChild.id, description: 'is parent of'}
  })

  elements.edges.push({
    data: {source: 'urn:mrn:signalk:uuid:childvessel', target: testChild2.id, description: 'is parent of'}
  })

  elements.edges.push({
    data: {source: testChild.id, target: testChild2.id, description: 'is parent of'}
  })



  Object.entries(vesselsData).forEach((vessel) => {
    const vesselID = vessel[1].uuid
    const vesselName = vessel[1].name

    // TODO: remove this cases for production
    const vesselChildren =
      vesselID === 'urn:mrn:signalk:uuid:parentvessel'
        ? ['urn:mrn:signalk:uuid:childvessel']
        : vessel[1].children['value'] ?? []

    elements.nodes.push({
      data: { id: vesselID, name: vesselName }
    })

    vesselChildren.forEach((child) => {
      console.log('creating edge from: ' + vesselID + ' to: ' + child)
      elements.edges.push({
        data: { source: vesselID, target: child, description: 'is parent of' }
      })
    })


  })

  return elements
}

function generateGraphView(vesselsData) {
  const graphView = document.getElementById('graphView')
  const cy = cytoscape({
    container: graphView,

    elements: vesselToGraph(vesselsData),

    boxSelectionEnabled: false,
    autounselectify: true,

    style:cytoscape
        .stylesheet()
        .selector('node')
        .css({
          height: 100,
          width: 100,
          'shape': 'ellipse',
          'background-fit': 'cover',
          'background-color': '#FFF',
          'border-color' :'#0c5460',
          'border-width': '1',
          'border-opacity': '1',
          'text-valign':'bottom',
          'margin':'20px',
          'background-image': 'https://static.thenounproject.com/png/1495034-200.png',
          content: 'data(name)',
        })
        .selector('edge')
        .css({
          width: 5,
          'color': 'black',
          'target-arrow-shape': 'triangle',
          'line-color': 'lightblue',
          'target-arrow-color': 'lightblue',
          'curve-style': 'bezier',
          content: 'data(description)'
        })
    ,

    layout: {
      name: 'breadthfirst',
      directed: true,
      padding: 40
    }
  })// cy init

  cy.on('tap', 'node', function(){
    const tapped = this;

    const vesselID = tapped[0]._private.data.id;
    const vesselData = vesselsData[vesselID]
    console.log(`Building table for: ${vesselData.name}`)

    const toggleButton = document.getElementById("button");
    toggleButton.classList.toggle("d-none")

    //prende nave cliccata per stamparne la tabella
    const table = buildTable(vesselData)
    body.appendChild(table)
    graphView.classList.toggle("d-none");

    let socket = openSocket(vesselData.uuid, table)


    toggleButton.addEventListener("click",()=>{
      body.removeChild(table)
      socket.close(1000,"Connection ended")
      toggleButton.classList.toggle("d-none")
      graphView.classList.toggle("d-none");
    })

  }); // on tap

  cy.on('mouseover', 'node', function(evt) {
    evt.target.style({
      'border-width':'5',
      'width':'120',
      'height':'120'});
  });
  cy.on('mouseout', 'node', function(evt) {
    evt.target.style({
      'border-color': '#0c5460',
      'border-width':'1',
      'width':'100',
      'height':'100'
    });
  });

}

function openSocket(vesselUUID, table){

  // declaring websocket
  // TODO: change the host for production
  let socket = new WebSocket('ws://localhost:3001/signalk/v1/stream?subscribe=none')

  // defining socket behavior when reading a message
  socket.onmessage = function(event) {
    // parsing the Delta update from the server
    const update = JSON.parse(event.data)
    // updates the values in the table
    updateTable(update.updates[0].values[0],table)
  };

  // defining socket behavior on open connection
  socket.onopen = function (event) {
    console.log(`connection established, socket status: ${event.type}`)

    // sends subscription details for the specific vessel
      socket.send(`{
          "context": "vessels.${vesselUUID}",
          "subscribe": [{
              "path": "navigation.*",
              "period": "10000"
           },
           {
              "path": "environment.*",
              "period": "10000"
           },
           {
              "path": "performance.*",
              "period": "10000"
           }]
          }`)
  }

  // defining socket behavior on closing connection
  socket.onclose = function(event) {
    if (event.wasClean) {
      console.log(`[close] Connection closed cleanly, code=${event.code} reason=${event.reason}`);
    } else {
      alert('[close] Connection died');
    }
  };

  // defining socket behavior on error
  socket.onerror = function(error) {
    alert(`[error] ${error}`);
  };

  return socket
}

// function that takes update values from the ws and updates the fields in the table
function updateTable(update, table) {
  // Parse the update to get the value
  let value = update.value;
  // editing the path to reflect the path displayed on the table
  update.path = update.path.replace("."," > ");

  // Get all the table cells
  let cells = table.getElementsByTagName("td");
  // Iterate over the cells
  for (let i = 0; i < cells.length; i++) {
    // Check if the cell's text content matches the update's key
    if (cells[i].textContent.includes(update.path)) {
      // Update the next cell's text content with the new value
      if(!Number.isFinite(value)) {
        // checks if the value is a number or if it has subfields
        for (const key in value)
          cells[i+1].textContent = value[key].toFixed(3)
      } else
        cells[i + 1].textContent =  value.toFixed(3)
    }
  }
  console.log("Table updated!")
}
