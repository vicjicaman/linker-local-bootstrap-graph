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
  const hostsContent = fs.readFileSync("/etc/hosts");

  const current = await get(host);
  if (current) {
    return true;
  }

  try {
    fs.appendFileSync("/etc/hosts", `${ip} ${host} #repoflow-linker-entry\n`);
    return true;
  } catch (e) {
    cxt.logger.error("hosts.add.error", { error: e.toString() });
    return false;
  }
};

export const remove = async ({ host, ip }, cxt) => {
  const hostsContent = fs.readFileSync("/etc/hosts");

  const lines = hostsContent.split("\n");
  for (let i = 0; i < lines.length; i++) {
    const values = line.trim().split(/\s+/);
    if (values[1] === host) {
      lines.splice(i, 1);
    }
  }

  fs.writeSyncFile("/etc/hosts", lines.join("\n"));
  return null;
};
