if(window.location.hash) {
  // remove the hash and split the hash
  var hash = window.location.hash.substr(1).split('-');

  if (hash.length == 4) {
    var key = hash[0];
    var userId = hash[1];
    var workBoardId = hash[2];
    var customerBoardId = hash[3];

    setLocalStorage(gbcKey, key);
    setLocalStorage(gbcUserId, userId);
    setLocalStorage(gbcWorkBoardId, workBoardId);
    setLocalStorage(gbcCustomerBoardId, customerBoardId);

    // redirect without any hash
    window.location.replace('job-completion.html');
  } else {
    notification('Not enough values in settings.', 'danger');
  }
}

var workBoardColumns = [
  {
    'columnId': 'people8',
    'columnName': 'colour check'
  },
  {
    'columnId': 'people',
    'columnName': 'coat'
  },
  {
    'columnId': 'people4',
    'columnName': 'goods-out check'
  },
  {
    'columnId': 'people3',
    'columnName': 'aluminium pre-treat'
  },
  {
    'columnId': 'people0',
    'columnName': 'blast'
  },
  {
    'columnId': 'people00',
    'columnName': 'goods-in check'
  }
];

var userName = '';
var jobNumber = '';

gbc('#job-number').on('keyup', function(e) {
  if (e.keyCode === 13) {
    e.preventDefault();
    getJobStaff();
  }
})

gbc('#complete-job').on('click', function(e) {
  getJobStaff();
});

gbc('#add-update').on('click', function(e) {
  addUpdate();
});

logOnToMonday();

function logOnToMonday() {

  var mondayQuery = '{ users (ids: [' + userId + ']) { name } }';

  callMonday(mondayQuery, function(data) {
    var loggedInUser = data['data']['users'];

    if (loggedInUser.length != 1) {
      showError('Could not log on');
    } else {
      userName = data['data']['users'][0]['name'];
      gbc('#user').text('Logged on as ' + userName);
      hideLoading();
    }
  });
}

function addUpdate() {
  let jobUpdate = gbc('#job-update').val();

  if (jobUpdate == '') {
    notification('Please enter an update', 'warning');
  } else {
    showLoading('Adding update');

    let mondayQuery = 'mutation { create_update (item_id: ' + jobNumber +
      ', body: "<p>' + userName + ': ' + jobUpdate + '</p>") { id } }';

    callMonday(mondayQuery, function(data) {
      hideLoading();
      getJobStaff();
    });
  }
}

function getJobStaff() {
  let jobNumberTextBox = gbc('#job-number').val();
  gbc('#job-actions').html(''); // clear any job actions already generated
  gbc('#job-updates').html(''); // clear any job updates already generated
  gbc('#job-update').val(''); // clear job update text
  jobNumber = ''; // clear update job id
  gbc('#job-editing').addClass('uk-hidden'); // always ensure editing is hidden until...

  if (jobNumberTextBox == '') {
    notification('Please enter a job number', 'warning');
  } else {
    showLoading('Loading job');

    let mondayQuery = '{ items_by_column_values ' +
      '(board_id: ' + workBoardId + ', column_id: "name", column_value: "' + jobNumberTextBox + '") ' +
      '{ id, name, column_values { id, text, value }, updates(limit: 10) { body } } }';

    callMonday(mondayQuery, function(data) {

      hideLoading();

      var jobJson = data['data']['items_by_column_values'];

      if (jobJson.length == 0) {
        notification('There was no job found with the number ' + jobNumberTextBox, 'danger');
      } else if (jobJson.length > 1) {
        showError('There are multiple jobs with the number ' + jobNumberTextBox + ', please speak to the office', 'danger');
      } else {
        // ... until a valid job is provided
        gbc('#job-editing').removeClass('uk-hidden');

        jobJson = jobJson[0]; // get the first job in the array (this should be the only job)

        var itemUpdates = jobJson['updates'];
        var itemUpdateString = '';

        for (i = 0; i < itemUpdates.length; i++) {
          itemUpdateString += itemUpdates[i]['body'];
        }

        document.getElementById('job-updates').innerHTML = itemUpdateString;

        for (i = 0; i < workBoardColumns.length; i++) {
          var newAssignedIds = [];
          var alreadyAssigned = false;

          let currentlyAssignedJson = jobJson['column_values'].find(x => x.id === workBoardColumns[i]['columnId']);
          let currentlyAssignedValue = currentlyAssignedJson['value'];
          let currentlyAssignedText = currentlyAssignedJson['text'];

          if (currentlyAssignedValue != null) {
            // get currently assigned IDs
            newAssignedIds = JSON.parse(currentlyAssignedValue)['personsAndTeams'];

            // find out if current user is already assigned
            if (newAssignedIds.length > 0) {
              alreadyAssigned = !(newAssignedIds.find(x => x.id == userId) === undefined);
            }
          }

          // set who would be assigned if the user clicks the assign or unassign button
          if (alreadyAssigned) {
            var removeIndex = newAssignedIds.map(function(item) { return item.id; }).indexOf(userId);
            newAssignedIds.splice(removeIndex, 1);
          } else {
            newAssignedIds.push({id: userId, kind: 'person'});
          }

          // card
          var cardDiv = document.createElement('div');
          cardDiv.classList.add('uk-card', 'uk-card-default', 'uk-card-body', 'uk-card-small');
          cardDiv.setAttribute('uk-scrollspy', 'cls:uk-animation-fade');

          // card > flex
          var cardFlexDiv = document.createElement('div');
          cardFlexDiv.classList.add('uk-flex', 'uk-flex-middle');

          // card > flex > text
          var div = document.createElement('div');
          div.classList.add('uk-flex-1');

          if (currentlyAssignedText.length != 0) {
            div.innerHTML = capitalise(workBoardColumns[i]['columnName'] + 'ers: ' + currentlyAssignedText);
          } else {
            div.innerHTML = 'No ' + workBoardColumns[i]['columnName'] + 'ers assigned.';
          }

          cardFlexDiv.appendChild(div);

          // card > flex > button div
          var cardButtonDiv = document.createElement('div');
          cardButtonDiv.classList.add('uk-flex-none');

          // card > flex > button div > button
          var button = document.createElement('button');
          button.classList.add('uk-button', 'uk-border-rounded');
          button.classList.add('uk-button', 'uk-margin-small-left');
          button.setAttribute('data-column-id', workBoardColumns[i]['columnId']);
          button.setAttribute('data-new-assigned-ids', JSON.stringify(newAssignedIds));

          var confirmPrompt;

          if (alreadyAssigned) {
            button.classList.add('uk-button-danger');
            button.setAttribute('uk-tooltip', 'title: Remove ' + userName + ' as ' + workBoardColumns[i]['columnName'] + 'er');
            button.innerHTML = '<span uk-icon="icon: user-x"></span>';
          } else {
            button.classList.add('uk-button-secondary');
            button.setAttribute('uk-tooltip', 'title: Add ' + userName + ' as ' + workBoardColumns[i]['columnName'] + 'er');
            button.innerHTML = '<span uk-icon="icon: user-plus"></span>';
          }

          button.addEventListener('click', function(e) {
            setAssignedStaff(jobNumberTextBox, jobJson['id'], this.getAttribute('data-column-id'), this.getAttribute('data-new-assigned-ids'));
          });

          jobNumber = jobJson['id'];

          cardFlexDiv.appendChild(button);
          cardDiv.appendChild(cardFlexDiv);
          document.getElementById('job-actions').appendChild(cardDiv);
        }
      }
    });
  }
}

function setAssignedStaff(itemName, itemId, columnId, newAssignedIds) {
  showLoading('Updating job');

  var fixPeopleJson = JSON.stringify('{}');

  // if there are people, set the correct json
  if (newAssignedIds != '[]') {
    fixPeopleJson = JSON.stringify('{"personsAndTeams":' + newAssignedIds + '}');
  }

  var mondayQuery = 'mutation { change_column_value ' +
    '(board_id: ' + workBoardId + ', item_id: ' + itemId + ', column_id: "' + columnId + '", value: ' + fixPeopleJson + ') ' +
    '{ id, name } }';

  callMonday(mondayQuery, function(data) {
    hideLoading();
    getJobStaff();
  });
}

function hideLoading() {
  gbc('#loading').addClass('uk-hidden');
}

function showLoading(message) {
  gbc('#loading').removeClass('uk-hidden');
  gbc('#loading-spinner').removeClass('uk-hidden');
  gbc('#loading-message').html(message);
}

function showError(error) {
  gbc('#loading').removeClass('uk-hidden');
  gbc('#loading-spinner').addClass('uk-hidden');
  gbc('#loading-message').html('Error: ' + error);
}

const capitalise = (s) => {
  if (typeof s !== 'string') return '';
  return s.charAt(0).toUpperCase() + s.slice(1);
}
