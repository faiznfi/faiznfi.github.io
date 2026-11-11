import { onCLS, onINP, onLCP, type Metric } from "web-vitals";
import { track } from "./analytics";

function report(metric: Metric) {
  track("web_vitals", {
    metric_name: metric.name,
    // CLS is a unitless score (e.g. 0.05). Scale it by 1000 so it survives
    // being stored as an integer metric, as Google's web-vitals docs recommend.
    metric_value: Math.round(metric.name === "CLS" ? metric.value * 1000 : metric.value),
    metric_rating: metric.rating,
    metric_id: metric.id,
  });
}

/** Report Core Web Vitals (LCP, INP, CLS) to the dataLayer. */
export function initWebVitals() {
  onLCP(report);
  onINP(report);
  onCLS(report);
}
