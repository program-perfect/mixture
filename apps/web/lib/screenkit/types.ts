/**
 * Canonical screenkit types now live in the shared `@screenkit/core` package so
 * both the app and the insert scene packages depend on the same definitions.
 * This module re-exports them so existing `@/lib/screenkit/types` imports across
 * the app keep working unchanged.
 */
export * from "@screenkit/core"
