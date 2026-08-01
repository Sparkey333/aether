#!/usr/bin/env node
import { PROVIDERS, generate } from './index.mjs';
import { PROMPTS, listPromptKeys } from './prompts/hollowmark-prompts.mjs';
import path from 'node:path';

function parseArgs(argv) {
  const args = { provider: 'mock', kind: null, out: null, all: false, list: false };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--list') args.list = true;
    else if (a === '--all') args.all = true;
    else if (a === '--provider') args.provider = argv[++i];
    else if (a === '--kind') args.kind = argv[++i];
    else if (a === '--promptKey') args.promptKey = argv[++i];
    else if (a === '--prompt') args.prompt = argv[++i];
    else if (a === '--out') args.out = argv[++i];
    else if (a === '--mock') args.provider = 'mock';
  }
  return args;
}

function printUsage() {
  console.log(`HOLLOWMARK asset pipeline

  node cli.mjs --list                                   list providers and prompt keys
  node cli.mjs --provider mock --promptKey rook          generate one asset (works with zero keys)
  node cli.mjs --provider stability --promptKey rook      generate with a real provider (needs its API key in .env)
  node cli.mjs --provider stability --prompt "..." --out out/custom.png   freeform prompt
  node cli.mjs --provider mock --all                     batch every entry in the prompt library

Providers:
${Object.entries(PROVIDERS).map(([name, p]) => `  ${name.padEnd(11)} ${p.kinds.join('/').padEnd(12)} ${p.confidence}`).join('\n')}

Prompt keys: ${listPromptKeys().join(', ')}
`);
}

async function runOne(args, promptKey, promptEntry) {
  const kind = args.kind || promptEntry?.kind || 'image';
  const prompt = args.prompt || promptEntry?.prompt;
  if (!prompt) throw new Error('No prompt — pass --prompt "..." or --promptKey <name> (see --list).');

  const ext = kind === 'video' ? 'mp4' : 'png';
  const outPath = args.out || path.join('out', `${promptKey || 'output'}.${ext}`);

  console.log(`→ ${args.provider} (${kind}): ${promptKey || '(freeform prompt)'}`);
  const result = await generate(args.provider, kind, { prompt, outPath });
  console.log(`  saved ${result.outPath}`);
  return result;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));

  if (args.list || (!args.all && !args.promptKey && !args.prompt)) {
    printUsage();
    return;
  }

  if (args.all) {
    let ok = 0, failed = 0;
    for (const [key, entry] of Object.entries(PROMPTS)) {
      try {
        await runOne({ ...args, out: null }, key, entry);
        ok++;
      } catch (error) {
        failed++;
        console.error(`  ✗ ${key}: ${error.message}`);
      }
    }
    console.log(`\n${ok} generated, ${failed} failed.`);
    return;
  }

  const promptEntry = args.promptKey ? PROMPTS[args.promptKey] : null;
  if (args.promptKey && !promptEntry) {
    console.error(`Unknown prompt key "${args.promptKey}". Known keys: ${listPromptKeys().join(', ')}`);
    process.exitCode = 1;
    return;
  }
  await runOne(args, args.promptKey, promptEntry);
}

main().catch((error) => {
  console.error(`✗ ${error.message}`);
  process.exitCode = 1;
});
