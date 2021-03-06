var gbcKey = 'gbc-key';
var gbcUserId = 'gbc-user-id';
var gbcWorkBoardId = 'gbc-work-board-id';
var gbcCustomerBoardId = 'gbc-customer-board-id';

var api = getLocalStorage(gbcKey);
var userId = parseInt(getLocalStorage(gbcUserId));
var workBoardId = getLocalStorage(gbcWorkBoardId);
var customerBoardId = getLocalStorage(gbcCustomerBoardId);

function getLocalStorage(key) {
  return localStorage.getItem(key);
}

function setLocalStorage(key, val) {
  localStorage.setItem(key, val);
}

function clearLocalStorage(key) {
  localStorage.removeItem(key);
}


function notification(message, notificationType) {
  UIkit.notification({
    message: message,
    status: notificationType,
    pos: 'bottom-center',
    timeout: 5000
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
    console.log(data);

    if (data['errors'] !== undefined) {
      alert('Error occurred, see console.')
      return false;
    }

    func(data)
  })
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
