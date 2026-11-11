# Tracking Plan — faiznfi.github.io

**Stack:** Google Tag Manager (`GTM-TFV5BSX`) → Google Analytics 4 → (planned) BigQuery export → Looker Studio  
**Implementation:** `src/lib/analytics.ts` (typed `track()` helper), `src/lib/webVitals.ts`, `src/hooks/useInViewOnce.ts`

## Goals & questions this tracking answers

| Business question | Answered by |
|---|---|
| Where do visitors (recruiters, peers) come from? | `page_view` + UTM-tagged links (see [UTM convention](#utm-convention)) |
| How far do visitors read? | `section_view`, `experience_view` |
| Which project attracts the most interest? | `view_item_list` → `select_item` (item list CTR) |
| Does the site produce contacts? | `generate_lead`, `social_click` (**key events**) |
| Is the site fast for real users? | `web_vitals` (LCP, INP, CLS) |

## dataLayer contract

Every custom event is pushed in two steps:

```js
dataLayer.push({ event_params: null, ecommerce: null });   // reset
dataLayer.push({ event: "<event_name>", event_params: { ... } });
```

GTM merges all pushes into one data model. The reset stops parameters from an
earlier event leaking into a later event that doesn't set them. All custom
parameters live under `event_params.*`. GA4 ecommerce events use the standard
`ecommerce` object instead.

Naming: `snake_case`. GA4 [recommended events](https://support.google.com/analytics/answer/9267735)
are used wherever one fits (`generate_lead`, `view_item_list`, `select_item`).

## Events

| Event | Trigger | Parameters | Key event |
|---|---|---|---|
| `page_view` | Page load (Google Tag, automatic) | — | |
| `section_view` | Section's top edge crosses mid-viewport, once per page load | `section_name`: `projects` \| `resume` | |
| `view_item_list` | Project grid crosses mid-viewport, once | `ecommerce.items[]`: `item_id`, `item_name`, `item_category`, `index`, `item_list_id`, `item_list_name` | |
| `select_item` | Click on a project's **LAUNCH_INTERFACE** link | `ecommerce.items[0]` (same item shape) | |
| `cta_click` | Click on a Hero button | `link_text`, `link_url`, `click_location`: `hero` | |
| `navigation_click` | Click on a nav link, logo, or footer link | `link_text`, `link_url`, `click_location`: `header` \| `mobile_menu` \| `footer` | |
| `menu_open` | Mobile menu opened | `click_location`: `header` | |
| `generate_lead` | Click on any `mailto:` link | `method`: `email`, `click_location`: `header` \| `mobile_menu` \| `resume` | ✅ |
| `social_click` | Click on GitHub / LinkedIn | `platform`: `github` \| `linkedin`, `link_url`, `click_location`: `resume` | ✅ |
| `experience_view` | Experience item crosses mid-viewport, once | `company`, `role`, `position` (1 = most recent) | |
| `whoami_action` | Demo interaction on the unlisted `/whoami/` page | `demo_action`: `ip_lookup` \| `precise_location` \| `typing_demo`, `demo_result`: `success` \| `error` \| `granted` \| `denied` \| `started` | |
| `web_vitals` | Reported by the `web-vitals` library (LCP on load, INP/CLS on page hide) | `metric_name`, `metric_value` (ms; CLS × 1000), `metric_rating`: `good` \| `needs-improvement` \| `poor`, `metric_id` | |

## GA4 custom definitions

| Name | Scope | Parameter |
|---|---|---|
| Section name | Event | `section_name` |
| Click location | Event | `click_location` |
| Platform | Event | `platform` |
| Company | Event | `company` |
| Role | Event | `role` |
| Experience position | Event | `position` |
| Metric name | Event | `metric_name` |
| Metric rating | Event | `metric_rating` |
| Metric value | Event (custom metric, Standard) | `metric_value` |
| Demo action | Event | `demo_action` |
| Demo result | Event | `demo_result` |

`link_text`, `link_url` and `method` are built-in GA4 dimensions. `metric_id`
is deliberately not registered (too many unique values); use it in BigQuery to
de-duplicate Web Vitals reports.

## `/whoami/` privacy demo

An unlisted teaching page, not linked from the homepage and marked `noindex`.
It reads everything a website can learn about a visitor (location, device,
fingerprint, behaviour, typed text) and shows it **only to that visitor**.
None of those values are pushed to the dataLayer. The only analytics are the
aggregate `whoami_action` events above, for example to answer "how many
visitors grant GPS when asked?". The IP lookup sends the visitor's IP to
ipapi.co (fallback ipwho.is), and only after an explicit click.

## UTM convention

Tag every link that points at the portfolio:

| Placement | utm_source | utm_medium | utm_campaign |
|---|---|---|---|
| LinkedIn profile / featured | `linkedin` | `social` | `profile` |
| GitHub profile README | `github` | `social` | `profile` |
| CV (PDF) | `cv` | `document` | `job_application` |
| Email signature | `email` | `signature` | `profile` |

Example: `https://faiznfi.github.io/?utm_source=linkedin&utm_medium=social&utm_campaign=profile`

## QA checklist

1. `npm run dev`: each push is logged to the console as `[dataLayer]`.
2. GTM **Preview**: every event fires the *GA4 Event – dataLayer* tag, with the expected parameters.
3. GA4 **DebugView**: events arrive with the right parameter values.
4. A parameter from an earlier event must not show up on a later one (checks the reset).

## Changelog

| Date | Change |
|---|---|
| 2026-11-11 | Initial implementation: GTM container, 10 custom events, Web Vitals |
| 2026-11-11 | Added `/whoami/` privacy demo and `whoami_action` event |
