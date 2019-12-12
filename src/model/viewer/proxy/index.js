import { execSync } from "child_process";
import path from "path";

export const get = async cxt => {
  const { instance } = cxt;

  const proxyid = `repoflow-linker-proxy-${instance.id}`;
  return {
    id: proxyid,
    proxyid,
    status: "-"
  };
};

export const restart = (proxy, cxt) => {
  const { workspace } = cxt;
  const folder = path.join(workspace, "proxy");

  cxt.logger.debug("proxy.stop");
  stop(proxy, cxt);

  cxt.logger.debug("proxy.start");
  start(proxy, cxt);

  return proxy;
};

export const start = (proxy, cxt) => {
  const { workspace, instance } = cxt;
  const folder = path.join(workspace, "proxy");

  try {
    execSync(
      `docker-compose -p ${proxy.proxyid} up --remove-orphans --detach`,
      {
        cwd: folder
      }
    );
  } catch (e) {
    const error = e.toString();

    cxt.logger.error("proxy.start.error", { proxyid: proxy.proxyid, error });

    if (error.includes("port is already allocated")) {
      throw new Error("proxy.start.port.busy");
    } else {
      throw new Error("proxy.start.error");
    }
  }

  return proxy;
};

export const stop = (proxy, cxt) => {
  const { workspace } = cxt;
  const folder = path.join(workspace, "proxy");

  execSync(`docker-compose -p ${proxy.proxyid} stop`, {
    cwd: folder
  });

  return proxy;
};

export const reload = (proxy, cxt) => {
  const { workspace } = cxt;
  const folder = path.join(workspace, "proxy");

  try {
    execSync(
      `COMPOSE_INTERACTIVE_NO_CLI=1 docker-compose -p ${proxy.proxyid} exec -T proxy nginx -s reload`,
      {
        cwd: folder
      }
    );
  } catch (e) {
    cxt.logger.error("proxy.error", {
      error: e.toString(),
      proxyid: proxy.proxyid
    });
    //throw e;
  }

  return proxy;
};
