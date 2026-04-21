# Why handoffs beat shared memory for multi-agent workflows

## The problem

Every AI coding agent is stateless between sessions and siloed from other agents. You finish a thread in Claude Code, switch to Cursor for a refactor, drop into Codex for a unit test — each one starts cold, and the context you built up dies.

## The obvious wrong answer: shared memory

The obvious solution is a giant shared memory pool that every agent reads from and writes to. Memorix, Mem0, Supermemory — they all take this shape. Everything you've ever said or done gets embedded, indexed, and surfaced on-demand to whichever agent is running.

It's the wrong shape. Three reasons:

**1. Retrieval noise compounds.** A shared pool means every agent retrieves against the same corpus. The more you use it, the noisier retrieval gets. The fix is usually "better retrieval" — but better retrieval doesn't fix the fact that *you don't want the agent to remember every random thing*.

**2. Provenance dissolves.** When everything goes into one bag, you lose the chain of custody. Who decided this? Which model? Was that a Claude decision or a Codex one? Under a shared-pool design, these are metadata fields you bolt on. Under a handoff design, they're the shape of the primitive.

**3. The real workflow is transactional.** When you switch agents, you don't want the new agent to know *everything*. You want it to know *the thing you just finished*, cleanly. A `/passoff` is a commit point. A commit point is more useful than an always-on memory stream.

## The Passoff shape

A handoff is an explicit event:

```
claude-code → ph_Mo12sReh → cursor → ph_GuqtDKDO → codex → ph_T0s2ZQvD
```

Each node carries:
- a structured markdown body the outgoing AI wrote deliberately
- the outgoing client (`from_client`) and self-declared model (`from_model`)
- the incoming client (`to_client`) stamped at load time
- a pointer to its parent, forming the chain

That's it. No embeddings, no ranking, no "which memories are relevant to this query". The agent asked for `latest` in this project, it got the most recent open handoff.

## What this lets you do

- **Resume mid-thought, across tools.** Pick up the baton in a new client without re-briefing.
- **Trace decisions.** `passoff thread <id>` shows the full chain: which AI made which call, in order.
- **Audit.** Every row has the timestamp, client, and model that wrote it. No need to trust the AI's self-report; the client name comes from the MCP protocol layer.
- **Forget cleanly.** Handoffs archive or delete as atoms. No orphaned embeddings to chase down.

## What this does NOT try to be

- **Not a memory layer.** If you want "remember what I worked on six weeks ago", use a memory tool. Passoff handoffs are for discrete, deliberate transitions, not ambient recall.
- **Not an orchestrator.** No task boards, no agent heartbeats. Passoff doesn't route work between agents — you do, it just carries the context.
- **Not multi-user.** Single-user, single-machine in v1. Team scoping is a v2 question.

## The positioning in one sentence

> Memory tools ask "what might be relevant?". Passoff answers "here is exactly what to load next."

Different shape, different use case, different primitive. Use both.
