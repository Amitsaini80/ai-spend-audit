# PROMPTS

This file will contain the full LLM prompts used for the personalized audit summary feature, plus notes on what prompt variants worked or failed.

## Day 1 prompt direction

The personalized summary should:

- Explain the biggest sources of overspend
- Stay concise, around 100 words
- Be grounded in the deterministic audit result
- Avoid inventing unsupported claims
- Gracefully degrade to a template when the model fails

