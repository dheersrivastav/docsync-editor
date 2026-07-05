export function mergeContent(
  base: string,
  server: string,
  client: string
): { merged: string; hadConflict: boolean } {
  if (client === server) return { merged: server, hadConflict: false };
  if (client === base) return { merged: server, hadConflict: false };
  if (server === base) return { merged: client, hadConflict: false };

  const baseBlocks = splitBlocks(base);
  const serverBlocks = splitBlocks(server);
  const clientBlocks = splitBlocks(client);

  const len = Math.max(baseBlocks.length, serverBlocks.length, clientBlocks.length);
  const result: string[] = [];
  let hadConflict = false;

  for (let i = 0; i < len; i++) {
    const b = baseBlocks[i] ?? "";
    const s = serverBlocks[i] ?? "";
    const c = clientBlocks[i] ?? "";

    const serverChanged = s !== b;
    const clientChanged = c !== b;

    if (serverChanged && clientChanged) {
      result.push(s); // both edited same block — server wins
      hadConflict = true;
    } else if (serverChanged) {
      result.push(s);
    } else if (clientChanged) {
      result.push(c);
    } else {
      result.push(b);
    }
  }

  return { merged: result.join(""), hadConflict };
}

function splitBlocks(html: string): string[] {
  return html
    .split(/(?<=<\/(?:p|h[1-6]|li|blockquote|pre|div|hr)>)/i)
    .map((s) => s.trim())
    .filter(Boolean);
}
