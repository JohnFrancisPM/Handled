# Fallback template (no LLM — ED §8.6, eval Ha-09)

When any agent/tool/DB/LLM call fails, the workflow returns this without a model call:

```
reply (general): "Thanks for reaching out to {{business.legal_name}} — I'm having a brief issue on my end. The owner has been notified and will follow up shortly."
reply (if message looked like an emergency): "If this is an emergency, please call 911 or your gas utility now. I'm having a brief technical issue and the on-call tech is being alerted."
```

Persist with `intent='fallback'`, create an owner `notifications` row (`kind='escalation'`, `channel='owner'`; add an `escalations` row only if the message was emergency-flagged), never a silent drop.
