import { apiFetch } from '@/api/client';
import type { Viewpoint } from '@/viewer/camera';

/** What a comment is about: a layer plus an ID that is stable across sessions. */
export interface CommentTarget {
  layerId: string;
  targetId: string;
  label: string | null;
}

/** Mirrors CommentView in code-with-quarkus (org.acme.comments.CommentDtos). */
export interface CommentView {
  id: string;
  layerId: string;
  targetId: string;
  targetLabel: string | null;
  body: string;
  authorName: string;
  viewpoint: Viewpoint | null;
  createdAt: string;
}

export class ApiError extends Error {
  constructor(readonly status: number, message: string) {
    super(message);
  }
}

export async function fetchComments(target: CommentTarget): Promise<CommentView[]> {
  const query = new URLSearchParams({ layer: target.layerId, target: target.targetId });
  const res = await apiFetch(`/api/comments?${query}`);
  if (!res.ok) throw new ApiError(res.status, `Could not load comments (${res.status})`);
  return res.json();
}

export async function postComment(
  target: CommentTarget,
  body: string,
  viewpoint: Viewpoint | null,
): Promise<CommentView> {
  const res = await apiFetch('/api/comments', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      layerId: target.layerId,
      targetId: target.targetId,
      targetLabel: target.label,
      body,
      viewpoint,
    }),
  });
  if (!res.ok) throw new ApiError(res.status, `Could not post comment (${res.status})`);
  return res.json();
}
