var api, customerBoardId;
var customers = [];
var xeroArr = [];

getCustomerData();

function getCustomerData() {
  var mondayQuery = 'query { boards (ids: ' + customerBoardId + ') { items { id column_values { id text } } } }'; // get all rows from customers

  callMonday(mondayQuery, function(data) {
    var customerData = data['data']['boards'][0]['items'];

    for (var i = 0; i < customerData.length; i++) {
      var customerId = customerData[i]['id'];
      var customerName = customerData[i]['column_values'].find(x => x.id === 'text4')['text'];

      customers.push({
        id: customerId,
        name: customerName
      });
    }

    getUpdatedJobs();
  });
}

function getUpdatedJobs() {

  var mondayQuery = 'query { items (ids: [343260470]) { name } }'; // most recent imported from Xero ID

  callMonday(mondayQuery, function(data) {
    var getItemsFrom = parseInt(data['data']['items'][0]['name']) + 1;
    var importFromXeroId = parseInt(prompt("Enter Xero ID to start import from", getItemsFrom), 10);

    getXeroData(importFromXeroId);
  });
}

function getXeroData(importFromXeroId) {
  var xeroData = document.getElementById('ext-gen40');

  for (var i = 1; i < xeroData.rows.length; i++) {
    var xeroId = parseInt(xeroData.rows[i].cells[0].innerText, 10);
    var mondayName = xeroId;
    var xeroReference = xeroData.rows[i].cells[1].innerText;
    var xeroCompany = xeroData.rows[i].cells[3].innerText;
    var companyId;

    try {
      companyId = customers.find(x => x.name === xeroCompany)['id'];
    } catch {
      companyId = '192484274'; // misc id
    }

    var xeroUrl = xeroData.rows[i].cells[3].getElementsByTagName('a')[0].getAttribute('href');
    var xeroStatus = xeroData.rows[i].cells[10].innerText;

    if (xeroId >= importFromXeroId) {
      xeroArr.push({
        number: mondayName.toString(),
        companyId: companyId,
        url: 'https://go.xero.com/AccountsReceivable/' + xeroUrl,
        status: xeroStatus,
        reference: xeroReference
      });
    }
  }

  addNewXeroRowsToMonday(importFromXeroId);
}

function addNewXeroRowsToMonday(importFromXeroId) {
  var maxXeroId = 0;

  for (var i = 0; i < xeroArr.length; i++) {
    var mondayQuery = 'mutation { create_item ( board_id: 608197264, group_id: "topics"' +
      ', item_name: "' + xeroArr[i].number + '"' +
      ', column_values: ' +
        JSON.stringify(
          '{\"text\":\"' + xeroArr[i].reference + '\", ' +
          '\"link\":{\"url\":\"' + xeroArr[i].url + '\",\"text\":\"Invoice\"}, ' +
          '\"link_to_item\":{\"item_ids\":[' + xeroArr[i].companyId + ']}}'
        ) +
      ') { id } }';

    callMonday(mondayQuery, function(data) { });

    if (xeroArr[i].number > maxXeroId) {
      maxXeroId = xeroArr[i].number;
    }
  }

  setLastXeroId(maxXeroId);
}

function setLastXeroId(maxXeroId) {
  var mondayQuery2 = 'mutation { change_column_value (board_id: 343257806, item_id: 343260470, column_id: "name", value: "' + maxXeroId + '") { id } }';
  callMonday(mondayQuery2, function(data) {
    alert('Invoices added to Monday.');
  });
}

function callMonday(query, func) {
  fetch ("https://api.monday.com/v2", {
    method: 'post',
    headers: {
      'Content-Type': 'application/json',
      'Authorization' : api
    },
    body: JSON.stringify({
      'query' : query
    })
  })
  .then((resp) => resp.json())
  .then(function(data) {
    if (data['errors'] !== undefined) {
      alert('Error occurred, see console.')
      console.log(data);
      return false;
    }

    func(data)
  })
}