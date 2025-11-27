# How to Implement VibePoint's AI Safety Architecture

## 1. Use a Guardrail System Prompt

Load `AI_BEHAVIOR_SPEC.md` into your OpenAI API `system` prompt.

Example:

```ts
const systemPrompt = fs.readFileSync('./docs/AI_BEHAVIOR_SPEC.md', 'utf8')
```

## 2. Template-Based Output (No Free-Form Chat)

Each response must use:

- State Snapshot
- Pattern Insight
- Shift Recommendation
- Upward Anchor

## 3. Negative Content Filter

If the user expresses negativity:

- Interrupt the pattern
- Redirect upward instantly

## 4. Disable Deep Emotional Multi-Turn Conversations

Limit sessions to:

- One shift
- One insight
- One action

## 5. Force Upward Endings

Post-process responses to ensure they end with:

- An action
- A positive question
- Or an upward anchor

## 6. Safety Logging

Log AI inputs/outputs without user identity.

This ensures quality + compliance.

## 7. Reinforce Through UI

Buttons like:

- "Shift Tools"
- "Better Thought"
- "Refocus"
- "Reset Physiology"
- "Next Best Step"

## Outcome

The AI cannot:

- Spiral
- Commiserate
- Validate negativity

It can only:

- Identify the pattern
- Break it
- Replace it
- Lift the user upward

