/**
 * React Router fetcher state constants
 * @see https://v2.remix.run/docs/hooks/use-fetcher#fetcherstate
 */
export const FETCHER_STATE = {
  /** Fetcher is idle and not currently submitting */
  IDLE: "idle",
  /** Fetcher is submitting data */
  SUBMITTING: "submitting",
  /** Fetcher is loading data after submission */
  LOADING: "loading",
} as const;

export type FetcherState = (typeof FETCHER_STATE)[keyof typeof FETCHER_STATE];

/**
 * Helper to check if fetcher is in a loading/submitting state
 */
export function isFetcherBusy(state: FetcherState): boolean {
  return state === FETCHER_STATE.SUBMITTING || state === FETCHER_STATE.LOADING;
}
