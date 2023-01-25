function vesselToGraph(vesselsData) {
  const elements = {}
  elements.nodes = []
  elements.edges = []

  Object.entries(vesselsData).forEach((vessel) => {
    const vesselID = vessel[1].uuid
    const vesselName = vessel[1].name

    const vesselChildren =
      vesselID == 'urn:mrn:signalk:uuid:parentvessel'
        ? ['urn:mrn:signalk:uuid:childvessel']
        : vessel[1].children['value'] ?? []
    const vesselParents =
      vesselID == 'urn:mrn:signalk:uuid:parentvessel'
        ? []
        : vessel[1].parents['value'] ?? []

    elements.nodes.push({
      data: { id: vesselID, name: vesselName, position: [150, 120] }
    })

    vesselChildren.forEach((child) => {
      console.log('creating edge from: ' + vesselID + ' to: ' + child)
      elements.edges.push({
        data: { source: vesselID, target: child, description: 'is parent of' }
      })
    })

    vesselParents.forEach((parent) => {
      console.log('creating edge from: ' + vesselID + ' to: ' + parent)
      elements.edges.push({
        data: { source: vesselID, target: parent, description: 'is child of' }
      })
    })
  })

  return elements
}

function generateGraphView(vesselsData) {
  const graphView = document.getElementById('graphView')
  var cy = cytoscape({
    container: graphView,

    elements: vesselToGraph(vesselsData),

    boxSelectionEnabled: false,
    autounselectify: true,

    style: cytoscape
      .stylesheet()
      .selector('node')
      .css({
        height: 100,
        width: 100,
        'background-fit': 'cover',
        'background-color': '#FFF',
        'border-color' :'#0c5460',
        'border-width': '1',
        'border-opacity': '1',
        'background-image': 'https://live.staticflickr.com/7272/7633179468_3e19e45a0c_b.jpg',
        content: 'data(name)'
      })
      .selector('edge')
      .css({
        width: 6,
        'target-arrow-shape': 'triangle',
        'line-color': '#0c5460',
        'target-arrow-color': '#0c5460',
        'curve-style': 'bezier',
        'text-color':"#fff",
        content: 'data(description)'
      }),

    layout: {
      name: 'breadthfirst',
      directed: true,
      padding: 20
    }
  })// cy init

  cy.on('tap', 'node', function(){
    const nodes = this;
    const tapped = nodes;

    graphView.classList.toggle("d-none");
    //TODO: prendere nave cliccata per stamparne la tabella
  }); // on tap
}
