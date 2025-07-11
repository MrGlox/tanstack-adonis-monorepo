import env from "#start/env";
import { defineConfig } from "@foadonis/shopkeeper";

export default defineConfig({
  key: env.get("STRIPE_KEY"),
  secret: env.get("STRIPE_SECRET"),

  currency: env.get("SHOPKEEPER_CURRENCY", "USD"),
  currencyLocale: env.get("SHOPKEEPER_CURRENCY_LOCALE", "en-US"),

  webhook: {
    secret: env.get("STRIPE_WEBHOOK_SECRET"),
    tolerance: 300,
  },

  models: {
    customerModel: () => import("#models/user"),
    subscriptionModel: () => import("@foadonis/shopkeeper/models/subscription"),
    subscriptionItemModel: () =>
      import("@foadonis/shopkeeper/models/subscription_item"),
  },

  calculateTaxes: false,

  keepIncompleteSubscriptionsActive: false,
  keepPastDueSubscriptionsActive: false,

  registerRoutes: true,
});