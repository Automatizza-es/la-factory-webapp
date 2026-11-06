import assert from "node:assert/strict";
import test from "node:test";
import { incidentAdminRecipients, deliverIncidentAdminAlerts } from "../src/lib/incident-alerts.ts";

const row = (id, role = "admin", status = "active", email = `${id}@example.test`) => ({
  contact_id: id, role,
  contacts: { status, first_name: id, email, preferred_locale: "es" },
});

test("only active admins are recipients, even if the database query contains extra rows", () => {
  const rows = [row("admin"), row("coworker", "coworker"), row("archived", "admin", "archived"),
    { ...row("missing"), contacts: null }, row("admin")];
  assert.deepEqual(incidentAdminRecipients(rows).map(r => r.contactId), ["admin"]);
});

test("push and email both go to admins and never to another member", async () => {
  const pushed = [], emailed = [];
  const result = await deliverIncidentAdminAlerts([row("first"), row("second"), row("member", "coworker")], {
    push: async r => pushed.push(r.contactId),
    email: async r => { emailed.push(r.contactId); return true; },
  });
  assert.deepEqual(pushed.sort(), ["first", "second"]);
  assert.deepEqual(emailed.sort(), ["first", "second"]);
  assert.deepEqual(result, { pushFailed: 0, emailFailed: 0 });
});

test("a failed channel does not block another channel or another admin", async () => {
  const pushed = [], emailed = [];
  const result = await deliverIncidentAdminAlerts([row("first"), row("second")], {
    push: r => { pushed.push(r.contactId); if (r.contactId === "first") throw new Error("push offline"); return Promise.resolve(); },
    email: async r => { emailed.push(r.contactId); return r.contactId !== "second"; },
  });
  assert.deepEqual(pushed.sort(), ["first", "second"]);
  assert.deepEqual(emailed.sort(), ["first", "second"]);
  assert.deepEqual(result, { pushFailed: 1, emailFailed: 1 });
});

test("missing email does not prevent push, and no email is attempted to an empty address", async () => {
  const pushed = [], emailed = [];
  const result = await deliverIncidentAdminAlerts([row("admin", "admin", "active", "  ")], {
    push: async r => pushed.push(r.contactId),
    email: async r => { emailed.push(r.email); return true; },
  });
  assert.deepEqual(pushed, ["admin"]);
  assert.deepEqual(emailed, []);
  assert.equal(result.emailFailed, 1);
});
