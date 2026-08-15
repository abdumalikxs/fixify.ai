import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

const BLOCK_TAGS = ['if', 'unless', 'for', 'case', 'form', 'paginate', 'capture', 'tablerow', 'comment', 'schema', 'style', 'javascript', 'stylesheet'];

function validate(path, content) {
  if (path.endsWith('.json')) {
    try {
      JSON.parse(content);
    } catch (e) {
      return { issue_type: 'JSON syntax error', summary: e.message };
    }
    return null;
  }

  if (path.endsWith('.liquid')) {
    const counts = {};
    const re = /\{%-?\s*(end)?([a-z]+)/g;
    let m;
    while ((m = re.exec(content)) !== null) {
      const tag = m[2];
      if (!BLOCK_TAGS.includes(tag)) continue;
      counts[tag] = (counts[tag] || 0) + (m[1] ? -1 : 1);
    }
    const unbalanced = Object.keys(counts).filter((t) => counts[t] !== 0);
    if (unbalanced.length > 0) {
      const tag = unbalanced[0];
      return {
        issue_type: 'Liquid syntax error',
        summary: counts[tag] > 0
          ? `'${tag}' tag was never closed — missing {% end${tag} %}`
          : `unexpected {% end${tag} %} with no matching {% ${tag} %}`,
      };
    }
    const schema = content.match(/\{%-?\s*schema\s*-?%\}([\s\S]*?)\{%-?\s*endschema/);
    if (schema) {
      try {
        JSON.parse(schema[1]);
      } catch (e) {
        return { issue_type: 'Section schema error', summary: `invalid JSON in {% schema %}: ${e.message}` };
      }
    }
  }
  return null;
}

export default async function (req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const source = String(body?.source || 'Pasted theme').slice(0, 80);
    const files = Array.isArray(body?.files) ? body.files.slice(0, 12) : [];
    if (files.length === 0) return Response.json({ error: 'No theme files were provided.' }, { status: 400 });

    const issues = [];
    for (const file of files) {
      const path = String(file?.path || '').slice(0, 200);
      const content = String(file?.content || '').slice(0, 20000);
      if (!path || !content) continue;

      const problem = validate(path, content);
      if (!problem) continue;

      const ai = await base44.asServiceRole.integrations.Core.InvokeLLM({
        prompt: `You are repairing a Shopify theme file that a merchant broke through the no-code theme editor.

File: ${path}
Detected problem: ${problem.issue_type} — ${problem.summary}

Return the ENTIRE corrected file content. Change nothing except what is required to make the file valid — keep all settings, keys, copy and formatting identical. Never invent new sections or settings.

--- FILE ---
${content}`,
        response_json_schema: {
          type: 'object',
          properties: {
            fixed_code: { type: 'string' },
            explanation: { type: 'string' },
            confidence: { type: 'string', enum: ['high', 'medium', 'low'] },
          },
          required: ['fixed_code', 'explanation'],
        },
      });

      const record = await base44.entities.ThemeIssue.create({
        source,
        file_path: path,
        issue_type: problem.issue_type,
        summary: problem.summary,
        broken_code: content,
        fixed_code: ai?.fixed_code || '',
        explanation: ai?.explanation || '',
        confidence: ai?.confidence || 'medium',
        status: 'Detected',
      });
      issues.push(record);
    }

    return Response.json({ scanned: files.length, found: issues.length, issues });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}