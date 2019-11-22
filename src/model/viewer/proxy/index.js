import { execSync } from "child_process";
import path from "path";

export const get = cxt => {
  return {
    status: "-"
  };
};

export const restart = cxt => {
  const { workspace } = cxt;
  const folder = path.join(workspace, "proxy");

  cxt.logger.debug("proxy.stop");
  stop(cxt);

  setTimeout(function() {
    cxt.logger.debug("proxy.start");
    start(cxt);
  }, 2500);

  return {
    status: "-"
  };
};

export const start = cxt => {
  const { workspace } = cxt;
  const folder = path.join(workspace, "proxy");

  execSync(
    `docker-compose -p repoflow-linker-proxy up --remove-orphans --detach`,
    {
      cwd: folder
    }
  );

  return {
    status: "-"
  };
};

export const stop = cxt => {
  const { workspace } = cxt;
  const folder = path.join(workspace, "proxy");

  execSync(`docker-compose -p repoflow-linker-proxy stop`, {
    cwd: folder
  });

  return {
    status: "-"
  };
};

export const reload = cxt => {
  const { workspace } = cxt;
  const folder = path.join(workspace, "proxy");

  execSync(
    `COMPOSE_INTERACTIVE_NO_CLI=1 docker-compose -p repoflow-linker-proxy exec -T proxy nginx -s reload`,
    {
      cwd: folder
    }
  );

  return {
    status: "-"
  };
};
