## Slide Text Style

Slides carry keywords, not prose: words, phrases, and taglines the audience can grasp at a glance, with the key information bolded. Full-sentence explanations go in the presenter notes (HTML comments), to be spoken aloud — never embedded in the slide body. `layout: statement` slides are the exception (their single line is the tagline). See "Slide text density" in `.claude/skills/slidev-deck/SKILL.md` for details.

Size on-slide text with the numeric scale (`text-4` = 16px, `text-5` = 20px, `text-6` = 24px), not the named one. The slide body is already 24px, so every named class from `text-xs` (12px) through `text-xl` (20px) *shrinks* text; `text-4` is the floor for anything the audience reads, including floating annotation boxes. When content overflows, make room (reflow the code across more lines, scope `--slidev-code-font-size` to the pane that needs it, drop cosmetic `<br>`, trim padding) rather than shrinking the text. See "Slide text sizing" in the skill.

## Closing Slide

The final slide is on screen longer than any other — through Q&A, while the host wraps up, while people photograph it — so it should be the fullest slide in the deck, not a sign-off. End on the takeaways, and reveal the links and QR code as a last click underneath them. "Thank you" is spoken, so it belongs in the presenter notes. A dedicated thank-you slide is fine only when it carries content of its own.

## Asset Size

The site is served from Cloudflare Workers static assets, which rejects any file over 25 MiB and fails the whole deploy. That covers built chunks as well as files in `public/`: anipres embeds its images in `timeline.json` as base64, and Slidev bundles the snapshot into a single JS chunk. Downscale or re-encode large videos and images (e.g. WebP, max 2560px long edge) before adding them.
