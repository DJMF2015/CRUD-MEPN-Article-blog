$(function () {
    $('.delete-article').on('click', function (e) {
      $target = $(e.target);
      const id = $target.attr('data-id');
      $.ajax({
        type: 'DELETE',
        url: '/articles/' + id,
        success: function (response) {
          window.location.href = '/';
        },
        error: (err) => {
          console.log(err);
        }
      });
    });
  });
