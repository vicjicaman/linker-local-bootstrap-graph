import fs from "fs";
import path from "path";

export const get = async (host, cxt) => {
  const hostsContent = fs.readFileSync("/etc/hosts").toString();

  const lines = hostsContent.split("\n");
  for (const line of lines) {
    const values = line.trim().split(/\s+/);
    if (values[1] === host) {
      return values[0];
    }
  }

  return null;
};

export const add = async ({ host, ip }, cxt) => {
  const current = await get(host);

  cxt.logger.debug("hosts.add.compare", { current, ip });

  if (current && current === ip) {
    return true;
  }

  try {
    await remove({ host }, cxt);
    fs.appendFileSync("/etc/hosts", `${ip} ${host} #repoflow-linker-entry\n`);
    return true;
  } catch (e) {
    cxt.logger.error("hosts.add.error", { error: e.toString() });
    return false;
  }
};

export const remove = async ({ host }, cxt) => {
  const hostsContent = fs.readFileSync("/etc/hosts").toString();

  const lines = hostsContent.split("\n");
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const values = line.trim().split(/\s+/);
    if (values[1] === host) {
      lines.splice(i, 1);
    }
  }

  fs.writeFileSync("/etc/hosts", lines.join("\n"));
  return null;
};
