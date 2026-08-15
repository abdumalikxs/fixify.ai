// The Lumina Eyewear theme repository as it currently sits on `main`.
// Two files are intentionally broken — these are what Theme Check fails on and
// what the Fixify agent heals in the demo.

export const THEME_REPO = "abdumalikxs/lumina-eyewear-theme";

export const BROKEN_INDEX_JSON = `{
  "sections": {
    "hero": {
      "type": "image-banner",
      "settings": {
        "heading": "See clearly. Look sharp.",
        "subheading": "Handmade acetate and titanium frames.",
        "cta_label": "Shop new arrivals",
      }
    },
    "featured": {
      "type": "featured-collection",
      "settings": {
        "collection": "mens-frames",
        "products_to_show": 6
      }
    },
    "recommendations": {
      "type": "product-recommendations",
      "settings": {
        "heading": "You may also like"
      }
  },
  "order": ["hero", "featured", "recommendations"]
}
`;

export const FIXED_INDEX_JSON = `{
  "sections": {
    "hero": {
      "type": "image-banner",
      "settings": {
        "heading": "See clearly. Look sharp.",
        "subheading": "Handmade acetate and titanium frames.",
        "cta_label": "Shop new arrivals"
      }
    },
    "featured": {
      "type": "featured-collection",
      "settings": {
        "collection": "mens-frames",
        "products_to_show": 6
      }
    },
    "recommendations": {
      "type": "product-recommendations",
      "settings": {
        "heading": "You may also like"
      }
    }
  },
  "order": ["hero", "featured", "recommendations"]
}
`;

export const BROKEN_THEME_LIQUID = `<!doctype html>
<html lang="{{ request.locale.iso_code }}">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>{{ page_title }} &ndash; {{ shop.name }}</title>
    {{ content_for_header }}
    {{ 'base.css' | asset_url | stylesheet_tag }}
  </head>
  <body class="template-{{ request.page_type }}">
    <header class="site-header">
      {% if section.settings.show_announcement %}
        <div class="announcement">{{ section.settings.announcement_text }}</div>

      {% render 'header-nav', linklist: linklists.main-menu %}
    </header>

    <main id="MainContent">
      {{ content_for_layout }}
    </main>

    {% section 'footer' %}
  </body>
</html>
`;

export const FIXED_THEME_LIQUID = `<!doctype html>
<html lang="{{ request.locale.iso_code }}">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>{{ page_title }} &ndash; {{ shop.name }}</title>
    {{ content_for_header }}
    {{ 'base.css' | asset_url | stylesheet_tag }}
  </head>
  <body class="template-{{ request.page_type }}">
    <header class="site-header">
      {% if section.settings.show_announcement %}
        <div class="announcement">{{ section.settings.announcement_text }}</div>
      {% endif %}

      {% render 'header-nav', linklist: linklists.main-menu %}
    </header>

    <main id="MainContent">
      {{ content_for_layout }}
    </main>

    {% section 'footer' %}
  </body>
</html>
`;

const PRODUCT_RECOMMENDATIONS = `{% comment %} sections/product-recommendations.liquid {% endcomment %}
<section class="recommendations" data-section-id="{{ section.id }}">
  <h2 class="recommendations__title">{{ section.settings.heading }}</h2>

  <ul class="recommendations__grid">
    {% for product in recommendations.products %}
      <li class="card">
        <a href="{{ product.url }}">
          {{ product.featured_image | image_url: width: 600 | image_tag: alt: product.title }}
          <p class="card__title">{{ product.title }}</p>
          <p class="card__price">{{ product.price | money }}</p>
        </a>
      </li>
    {% endfor %}
  </ul>
</section>

{% schema %}
{
  "name": "Product recommendations",
  "settings": [
    { "id": "heading", "type": "text", "label": "Heading", "default": "You may also like" }
  ]
}
{% endschema %}
`;

const HEADER_NAV_SNIPPET = `{% comment %} snippets/header-nav.liquid {% endcomment %}
<nav class="header-nav">
  <ul>
    {% for link in linklist.links %}
      <li><a href="{{ link.url }}">{{ link.title }}</a></li>
    {% endfor %}
  </ul>
  <a class="header-nav__cart" href="{{ routes.cart_url }}">
    Cart ({{ cart.item_count }})
  </a>
</nav>
`;

export const THEME_FILES = [
  {
    path: "layout/theme.liquid",
    code: BROKEN_THEME_LIQUID,
    broken: true,
    error: "Liquid syntax error: 'if' tag was never closed",
  },
  {
    path: "templates/index.json",
    code: BROKEN_INDEX_JSON,
    broken: true,
    error: "JSON syntax error: trailing comma and a missing closing brace",
  },
  { path: "sections/product-recommendations.liquid", code: PRODUCT_RECOMMENDATIONS },
  { path: "snippets/header-nav.liquid", code: HEADER_NAV_SNIPPET },
];