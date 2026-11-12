/**
 * Typed dataLayer helpers for Google Tag Manager.
 *
 * The site pushes semantic events. GTM maps them to GA4. Every parameter lives
 * under a single `event_params` key, and both `event_params` and `ecommerce`
 * are reset to null before each push. GTM merges every push into one data
 * model, so without the reset a parameter from an earlier event (say,
 * `section_name`) would leak into later events that don't set it.
 *
 * See docs/tracking-plan.md for the full event specification.
 */
import type { Project } from "../types";

export type SectionName = "projects" | "resume";
export type ClickLocation = "header" | "mobile_menu" | "hero" | "resume" | "footer";

/** Every custom event and its parameters. */
export interface EventMap {
  section_view: { section_name: SectionName };
  cta_click: { link_text: string; link_url: string; click_location: ClickLocation };
  navigation_click: { link_text: string; link_url: string; click_location: ClickLocation };
  menu_open: { click_location: "header" };
  generate_lead: { method: "email"; click_location: ClickLocation };
  social_click: { platform: "github" | "linkedin"; link_url: string; click_location: ClickLocation };
  experience_view: { company: string; role: string; position: number };
  /** /whoami demo. Only the action and its outcome are sent, never the values the page reveals. */
  whoami_action: {
    demo_action: "ip_lookup" | "precise_location" | "typing_demo";
    demo_result: "success" | "error" | "granted" | "denied" | "started";
  };
  web_vitals: {
    metric_name: string;
    metric_value: number;
    metric_rating: string;
    metric_id: string;
  };
}

type DataLayerMessage = Record<string, unknown>;

declare global {
  interface Window {
    dataLayer?: DataLayerMessage[];
  }
}

function push(message: DataLayerMessage) {
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event_params: null, ecommerce: null });
  window.dataLayer.push(message);
  if (import.meta.env.DEV) console.debug("[dataLayer]", message);
}

/** Push a custom event. Event names and parameters are checked by TypeScript. */
export function track<E extends keyof EventMap>(event: E, params: EventMap[E]) {
  push({ event, event_params: params });
}

// ---------------------------------------------------------------------------
// GA4 ecommerce: projects are treated as "items" in a list. This gives
// impression -> click CTR per project with GA4's built-in item reports.
// ---------------------------------------------------------------------------

const PROJECT_LIST = { item_list_id: "projects", item_list_name: "Intelligence Modules" } as const;

function toItem(project: Project, index: number) {
  return {
    item_id: project.id,
    item_name: project.title,
    item_category: project.tags[0],
    index,
    ...PROJECT_LIST,
  };
}

export function trackProjectListView(projects: Project[]) {
  push({
    event: "view_item_list",
    ecommerce: { ...PROJECT_LIST, items: projects.map(toItem) },
  });
}

export function trackProjectSelect(project: Project, index: number) {
  push({
    event: "select_item",
    ecommerce: { ...PROJECT_LIST, items: [toItem(project, index)] },
  });
}
