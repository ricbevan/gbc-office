document.addEventListener("DOMContentLoaded", function(event) {
  gbc('#key').val(api);
  gbc('#user-id').val(guserId);
  gbc('#work-board-id').val(workBoardId);
  gbc('#customer-board-id').val(customerBoardId);

  gbc('#save').on('click', function() {
    setLocalStorage(gbcKey, gbc('#key').val());
    setLocalStorage(gbcUserId, gbc('#user-id').val());
    setLocalStorage(gbcWorkBoardId, gbc('#work-board-id').val());
    setLocalStorage(gbcCustomerBoardId, gbc('#customer-board-id').val());

    notification('Saved sucessfully.', 'success');
  });
});
