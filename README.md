# Replace.js

Tool for adding simple AJAX functionality to a site. See the [demo] for example
use cases.

[demo]: http://causes.github.io/replacejs/demo/

## Background

After doing web development for a while, we noticed that most interactions we
added to the site involved catching a click event, performing an AJAX request,
and updating part of the page based on the result. This typically required a
lot of boilerplate JavaScript to set up click handlers. All that JavaScript
slowed down the initial page load, and until the page finished loading, things
didn't work right. It also required duplicating business and rendering logic on
the server and the client. The site was slow and our JS code was brittle and
difficult to test. We realized that one small library could implement this
pattern and replace most of our JS code base.

We weren't the first to reach a similar conclusion -- see Makinde Adeagbo's
excellent presentation on [Primer].

[Primer]: http://blip.tv/jsconf/makinde-adeagbo-primer-facebook-s-2k-of-javascript-to-power-almost-all-interactions-3858673

## Requirements

Any server-side language should do, though we use Rails. jQuery must be
present.

## Installation

Put the contents of `primer.min.js` in a &lt;script&gt; tag in the document
header. Link to `replace.js` at the bottom of the document body, below jQuery.

```html
<script src="/path/to/replace.js"></script>
```

## Usage

You declare a link to be "AJAX-ified" by giving it a `data-replace` attribute.
When the link is clicked, it will be replaced by the result of an AJAX request
to its `href`.

```html
<a href="/foo" data-replace>Foo</a>
```

It is up to you to ensure that the server returns an appropriate partial in
response to that AJAX request. If the URL also represents a full page that
might be visited normally (e.g. linked externally), add the `data-pushstate`
attribute to have the window's location updated using the `history.pushState()`
API.  The server can check the `X-Requested-With` header to determine whether
to return a partial or a full page.

```html
<a href="/foo" data-replace data-pushstate>Foo</a>
```

The `data-replace` attribute also works on forms, catching the `submit` event.

```html
<form action="/foo" data-replace>
  <input type="submit">
</form>
```

You can give `data-replace` a value, and the element's closest matching
ancestor will be replaced instead of the element itself.

```html
<div class="container">
  <a href="/foo" data-replace=".container">Foo</a>
</div>
```

## License

This project is released under the MIT license.
