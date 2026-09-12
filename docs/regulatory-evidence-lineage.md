# Regulatory Evidence Lineage UI

Policy Governance reads the immutable policy-version binding from `GET /api/admin/reference-evidence/policy-artifacts/{artifactId}/versions/{artifactVersion}`.

Each row displays official law/article, canonical regulatory evidence ID and source version, policy artifact/version, `CONNECTED` or `PENDING_REVIEW`, lifecycle stage, AI/Digital Asset execution pack, effective date, and source digest. No UI action auto-approves or activates a refresh candidate. An empty response is rendered as `MISSING` through the existing empty state.

The row also renders the exact `requirementRefs` and `controlRefs` persisted on the Evidence-to-Policy association. These are trace identities copied from the reviewed Registry; FE does not infer requirements, decide legal applicability, or trigger lifecycle commands.
