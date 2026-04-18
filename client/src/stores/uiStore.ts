'use client'

import { useSyncExternalStore } from 'react'

type UiState = { isLoading: boolean }

export type UiAction = { type: 'SET_LOADING'; payload: boolean }

function reducer(state: UiState, action: UiAction): UiState {
  switch (action.type) {
    case 'SET_LOADING':
      return { isLoading: action.payload }
    default:
      return state
  }
}

let memoryState: UiState = { isLoading: false }
const listeners = new Set<() => void>()

function emit() {
  listeners.forEach((l) => l())
}

function dispatchLoading(action: UiAction) {
  memoryState = reducer(memoryState, action)
  emit()
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

function getSnapshot(): UiState {
  return memoryState
}

const SERVER_SNAPSHOT: UiState = { isLoading: false }

function getServerSnapshot(): UiState {
  return SERVER_SNAPSHOT
}

/**
 * Trạng thái UI toàn cục.
 * - `loading.isLoading` — đọc trạng thái.
 * - `loading.dispatch({ type: 'SET_LOADING', payload: true | false })` — bật/tắt.
 */
export const loading = {
  get isLoading() {
    return memoryState.isLoading
  },
  dispatch: dispatchLoading,
}

/**
 * Hook cho component cần re-render khi `isLoading` đổi.
 */
export function useLoading() {
  const state = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
  return {
    isLoading: state.isLoading,
    dispatch: dispatchLoading,
    setLoading: (value: boolean) =>
      dispatchLoading({ type: 'SET_LOADING', payload: value }),
  }
}
