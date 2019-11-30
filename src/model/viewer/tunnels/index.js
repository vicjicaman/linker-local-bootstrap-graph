import * as TunnelUtils from "PKG/linker-tunnel";
import * as Utils from "@nebulario/linker-utils";

const TUNNELS_DATA = {};

export const get = async (tunnelid, cxt) => TUNNELS_DATA[tunnelid] || null;
export const list = async (args, cxt) => {
  const res = [];
  for (const k in TUNNELS_DATA) {
    res.push(TUNNELS_DATA[k]);
  }
  return res;
};

export const start = async ({ tunnelid, source, cluster, remote }, cxt) => {
  if (TUNNELS_DATA[tunnelid]) {
    cxt.logger.debug("bootstrap.tunnel.stop.existing", { tunnelid });
    await stop(TUNNELS_DATA[tunnelid], cxt);
    delete TUNNELS_DATA[tunnelid];
  }

  await TunnelUtils.forceStop(tunnelid, cxt);

  cxt.logger.debug("bootstrap.tunnel", { tunnelid, source, cluster });
  const op = await TunnelUtils.remote(
    tunnelid,
    [
      {
        source, // { host: outlet.localHost, port: outlet.localPort },
        dest: cluster // { host: "localhost", port: outlet.clusterPort }
      }
    ],
    {
      ...remote,
      key: remote.key.replace(cxt.paths.inner.workspace, cxt.workspace)
    },
    cxt
  );

  TUNNELS_DATA[tunnelid] = { id: tunnelid, tunnelid, operation: op };
  return TUNNELS_DATA[tunnelid];
};

export const stop = async (tunnel, cxt) => {
  if (tunnel) {
    const { tunnelid } = tunnel;
    cxt.logger.debug("tunnel.stop", { tunnelid: tunnelid });
    await TunnelUtils.stop(tunnel.operation, cxt);
    delete TUNNELS_DATA[tunnel.tunnelid];
    return true;
  }

  cxt.logger.debug("tunnel.stop.invalid");
  return false;
};
