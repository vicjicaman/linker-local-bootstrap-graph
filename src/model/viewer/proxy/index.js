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

  execSync(`docker-compose -p repoflow-linker-proxy stop`, {
    cwd: folder
  });

  execSync(
    `docker-compose -p repoflow-envs-control up --remove-orphans --detach`,
    {
      cwd: folder
    }
  );

  return {
    status: "-"
  };
};
