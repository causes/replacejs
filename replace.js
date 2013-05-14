// Allow links to replace part of the page, rather than the entire thing.
//
//   <div class="container">
//     <a href="/foo" data-replace=".container">Foo</a>
//   </div>
//
// When you click the link "Foo", it will:
// - Find an ancestor element matching the selector ".container".
// - Perform a GET request to /foo.
// - If the request is successful, replace the ancestor with the response body.
//
// It also works for forms:
//
//   <div class="container">
//     <form action="/bar" method="POST" data-replace=".container">
//       <input type="submit">
//     </form>
//   </div>
//
// Notes:
// - It is possible to replace the same element that was clicked/submitted. A
//   convenient selector for doing so is "*".
// - If a link has the attribute "data-pushstate" and the browser supports it,
//   the address bar will be updated on success using history.pushState.
// - The container will have the class ".replace-active" while a replace
//   operation is in progress. This can be useful for styling purposes.
// - Clicks inside a container with a replace operation in progress are ignored.
//   This obviates the need to prevent double submissions of forms.

(function($, undefined) {
  // Replace an element with the result of an AJAX request.
  $.fn.ajaxReplace = function(url, options) {
    if (this.closest('.replace-active').length) {
      return;
    }
    options = options || {};
    var $container = this.closest(options.selector || '*');
    $container.addClass('replace-active').trigger('replace:start');

    $.ajax(url, { type: options.method, data: options.data })
      .always(function() {
        $container.removeClass('replace-active').trigger('replace:always');
      })
      .done(function(data) {
        if (options.success) {
          options.success($container, data);
        }
        $(data).replaceAll($container).trigger('replace:done');
      })
      .fail(function() {
        $container.trigger('replace:fail');
      });
  };

  $(window).bind('popstate', function(event) {
    var state = event.originalEvent.state;
    if (state && state.selector) {
      $(state.data).replaceAll(state.selector)
                   .trigger('replace:always')
                   .trigger('replace:done');
    }
  });

  $(document).on('click', 'a[data-replace]', function(event) {
    var $link = $(this);

    if ($link.data('pushstate')) {
      if (!window.history || !history.pushState) {
        // If a link would like to use pushState but that is not supported by
        // the browser, we'll let it do a full page load. Affects IE 8/9 users.
        return;
      }
      if (event.shiftKey || event.metaKey) {
        // User is trying to open link in a new tab or window. Allow default.
        return;
      }
    }

    event.preventDefault();

    $link.ajaxReplace($link.attr('href'), {
      selector: $link.data('replace'),
      success: function($container, data) {
        if ($link.data('pushstate')) {
          history.replaceState({
            selector: $link.data('replace'),
            data: $container[0].outerHTML
          }, null);
          history.pushState({
            selector: $link.data('replace'),
            data: data
          }, null, $link.attr('href'));
        }
      }
    });
  });

  $(document).on('submit', 'form[data-replace]', function(event) {
    event.preventDefault();
    var $form = $(this);

    $form.ajaxReplace($form.attr('action'), {
      selector: $form.data('replace'),
      method: $form.attr('method'),
      data: $form.serialize()
    });
  });

  // When you submit a form using the built-in click handler for buttons, the
  // clicked button's name/value will be added to the query string. This can be
  // useful for knowing which button was clicked in a form with several of
  // them. When we submit the form programatically, the clicked button is no
  // longer active and we have no way of knowing which one it was. This click
  // handler emulates the built-in functionality.
  $(document).on('click', 'form[data-replace] button', function(event) {
    var $button = $(this);
    $('<input type="hidden">')
      .prop('name', $button.prop('name'))
      .val($button.val())
      .appendTo($button.closest('form'));
  });

  if (window.releaseClicks) {
    $.each(releaseClicks(), function(_, event) {
      $(event.target).trigger(event.type);
    })
  }
})(jQuery);
