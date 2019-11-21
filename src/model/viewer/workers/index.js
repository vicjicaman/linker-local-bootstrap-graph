import { execSync } from "child_process";
import path from "path";
import fs from "fs";

export const get = (workerid, cxt) => {
  const worker = {
    id: workerid,
    workerid,
    folder: path.join(cxt.workspace, "workers", workerid),
    status: "-"
  };

  if (fs.existsSync(worker.folder)) {
    return worker;
  } else {
    return null;
  }
};

export const start = (worker, cxt) => {
  const { workerid, folder } = worker;

  const stdout = execSync(
    `docker-compose -p ${workerid} up --remove-orphans --detach`,
    {
      cwd: folder
    }
  );
  cxt.logger.debug("worker.start", {
    workerid,
    stdout: stdout.toString(),
    folder
  });

  return worker;
};

export const restart = (worker, cxt) => {
  const { workerid, folder } = worker;

  execSync(`docker-compose -p ${workerid} restart ${workerid}`, {
    cwd: folder
  });

  return worker;
};

export const stop = (worker, cxt) => {
  const { workerid, folder } = worker;

  execSync(`docker-compose -p ${workerid} stop`, {
    cwd: folder
  });

  return worker;
};
