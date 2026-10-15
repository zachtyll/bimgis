import { apiFetch } from '@/api/client';
import type { LmFeatureCollection } from '@/features/plans/lmDetaljplan';
import type { PlanDraft, PlanStatus } from './draft';

/** Mirrors PlanSummary / PlanView in code-with-quarkus (org.acme.plans.PlanResource). */
export interface PlanSummary {
  id: string;
  version: number;
  name: string;
  status: PlanStatus;
  updatedAt: string;
}

export interface SavedPlan extends PlanSummary {
  draft: PlanDraft;
  delivery: LmFeatureCollection;
}

export class PlanApiError extends Error {
  constructor(readonly status: number, message: string) {
    super(message);
  }
}

async function json<T>(res: Response, what: string): Promise<T> {
  if (!res.ok) {
    const detail = await res.text().catch(() => '');
    throw new PlanApiError(res.status, `${what} failed (${res.status})${detail ? `: ${detail.slice(0, 200)}` : ''}`);
  }
  return res.json() as Promise<T>;
}

export const deliveryUrl = (s: PlanSummary) => `/api/plans/${s.id}/delivery?v=${s.version}`;

export async function listPlans(): Promise<PlanSummary[]> {
  return json(await apiFetch('/api/plans'), 'Loading plans');
}

export async function getPlan(id: string): Promise<SavedPlan> {
  return json(await apiFetch(`/api/plans/${id}`), 'Loading the plan');
}

export async function savePlan(
  draft: PlanDraft,
  delivery: LmFeatureCollection,
  expectedVersion: number | null,
): Promise<SavedPlan> {
  const isNew = expectedVersion === null;
  const res = await apiFetch(isNew ? '/api/plans' : `/api/plans/${draft.id}`, {
    method: isNew ? 'POST' : 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ expectedVersion, draft, delivery }),
  });
  return json(res, 'Saving the plan');
}
