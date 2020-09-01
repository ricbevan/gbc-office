var thisMonth;
var date = new Date();

if (!thisMonth)
  date.setMonth(date.getMonth() - 1);

var firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
var lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);

window.location.replace('https://go.xero.com/AccountsReceivable/Search.aspx?invoiceStatus=INVOICESTATUS%2fAUTHORISED&graphSearch=False&startDate=' +
  formatDate(firstDay) +
  '&endDate=' +
  formatDate(lastDay) +
  '&dateWithin=invoice&pageSize=25&orderBy=PaidToName&direction=ASC&unsentOnly=False');

function formatDate(date) {
  var d = new Date(date),
    month = '' + (d.getMonth() + 1),
    day = '' + d.getDate(),
    year = d.getFullYear();

  if (month.length < 2)
    month = '0' + month;

  if (day.length < 2)
    day = '0' + day;

  return [year, month, day].join('-');
}

// document.body.appendChild(document.createElement('script')).src='https://ricbevan.github.io/gbc-office/js/month-invoices.js?' + new Date().getTime();
// thisMonth = false;
