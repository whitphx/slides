# AGENTS.md

Instructions for AI coding agents working in this repository.

## Working around a problem in someone else's project

Sometimes a dependency, tool or service misbehaves and we work around it here. Workarounds
include an override or version pin, a skipped install script, a wrapper script, a patch, a
disabled check, or a retry. When that happens, consider whether the fix belongs upstream,
and ask before contributing it.

1. **Check that it really is upstream's problem**, not our misuse or configuration.
   - Reproduce it against the latest upstream release or default branch.
   - Search upstream's issues and pull requests for an existing report.
2. **Mark the workaround in our code.** Add a comment saying which upstream problem it
   works around and when it can be removed. Link the upstream issue once there is one.
3. **Ask the user before contributing.** In your report, say:
   - which project, and what the problem is;
   - what you'd contribute: an issue, a patch or pull request, or a docs fix;
   - whether it's already reported;
   - roughly how much work it is.

   Do this at the end of the task, or at a natural pause. Don't stop the current work to ask.
   Skip this step when the cause is on our side, or when an existing upstream report already
   covers it. In that case, just link the report in the comment from step 2.
4. **Do nothing outside this repository without approval.** That includes opening issues,
   posting comments, opening pull requests and forking repositories.
5. **After approval, keep the upstream work separate from the current task.**
   - Hand it to a subagent, or start a separate session for anything long, so the current
     task isn't blocked.
   - Write the issue text and the patch, test the patch against upstream's code, and give the
     drafts to the user to post. Post them yourself only if the user explicitly asks.
   - Upstream repositories are usually outside this session's GitHub access. Request access,
     or leave the posting to the user.
6. **Remove the workaround once upstream ships the fix.**
