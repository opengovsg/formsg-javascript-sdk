import webhooks from "./webhooks";
import crypto from "./crypto";

/**
 * Entrypoint into the FormSG SDK
 * @param {Object} options
 * @param {string} [options.mode] If set to 'staging' this will initialise
 * the SDK for the FormSG staging environment
 * @param {string} [options.webhookSecretKey] Optional base64 secret key for signing webhooks
 */
export default function (options: PackageInitParams = {}) {
  const { mode, webhookSecretKey } = options;

  return {
    webhooks: webhooks({
      mode: mode || "production",
      webhookSecretKey,
    }),
    crypto: crypto({
      mode: mode || "production",
    }),
  };
}
