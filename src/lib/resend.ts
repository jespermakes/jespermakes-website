const RESEND_BASE = "https://api.resend.com";

export interface ResendContact {
  id: string;
  email: string;
  first_name?: string | null;
  last_name?: string | null;
  unsubscribed: boolean;
  created_at: string;
}

export class ResendError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

function audienceId(): string {
  const id = process.env.RESEND_NEWSLETTER_AUDIENCE_ID;
  if (!id) throw new Error("RESEND_NEWSLETTER_AUDIENCE_ID not set");
  return id;
}

function apiKey(): string {
  const key = process.env.RESEND_API_KEY;
  if (!key) throw new Error("RESEND_API_KEY not set");
  return key;
}

async function resendFetch<T>(
  path: string,
  init: RequestInit = {}
): Promise<T> {
  const res = await fetch(`${RESEND_BASE}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${apiKey()}`,
      "Content-Type": "application/json",
      ...(init.headers ?? {}),
    },
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new ResendError(res.status, `Resend ${res.status} on ${path}: ${text.slice(0, 200)}`);
  }

  return res.json() as Promise<T>;
}

export async function createContact(input: {
  email: string;
  firstName?: string | null;
  unsubscribed?: boolean;
}): Promise<ResendContact> {
  const result = await resendFetch<{ data: ResendContact }>(
    `/audiences/${audienceId()}/contacts`,
    {
      method: "POST",
      body: JSON.stringify({
        email: input.email.toLowerCase().trim(),
        first_name: input.firstName ?? undefined,
        unsubscribed: input.unsubscribed ?? false,
      }),
    }
  );
  return result.data;
}

export async function updateContactBy(identifier: { email?: string; id?: string }, patch: { unsubscribed?: boolean; firstName?: string | null }): Promise<ResendContact> {
  const key = identifier.id ?? identifier.email;
  if (!key) throw new Error("Need email or id");

  const result = await resendFetch<{ data: ResendContact }>(
    `/audiences/${audienceId()}/contacts/${encodeURIComponent(key)}`,
    {
      method: "PATCH",
      body: JSON.stringify({
        unsubscribed: patch.unsubscribed,
        first_name: patch.firstName ?? undefined,
      }),
    }
  );
  return result.data;
}

export async function listAllContacts(): Promise<ResendContact[]> {
  // Resend currently returns all contacts in one response for most accounts.
  // If the API ever adds pagination and the response includes has_more/last_id,
  // extend this to loop. For 3,300 contacts a single request is fine.
  const result = await resendFetch<{ data: ResendContact[] }>(
    `/audiences/${audienceId()}/contacts`
  );
  return result.data ?? [];
}
