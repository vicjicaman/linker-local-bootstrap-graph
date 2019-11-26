const uuidv4 = require("uuid/v4");
import _ from "lodash";
import kill from "tree-kill";
import * as OperationUtils from "PKG/linker-operation";

import { spawn } from "child-process-promise";
import * as Utils from "@nebulario/linker-utils";

export const listen = async (tunnelid, fwds, opts, cxt) => {
  const { key, user, host, port } = opts;

  return await frame(
    tunnelid,
    "listen",
    [
      "-4",
      "-N",
      "-p",
      port,
      "-oStrictHostKeyChecking=no",
      "-oExitOnForwardFailure=yes",
      ..._.reduce(
        fwds,
        (res, { dest, source }) => {
          res.push(
            "-L",
            `${dest.host}:${dest.port}:${source.host}:${source.port}`
          );
          return res;
        },
        []
      ),
      "-i",
      key,
      `${user}@${host}`
    ],
    cxt
  );
};

export const remote = async (tunnelid, fwds, opts, cxt) => {
  const { key, user, host, port } = opts;

  return await frame(
    tunnelid,
    "remote",
    [
      "-N",
      "-p",
      port,
      "-oStrictHostKeyChecking=no",
      "-oExitOnForwardFailure=yes",
      ..._.reduce(
        fwds,
        (res, { dest, source }) => {
          res.push(
            "-R",
            `${dest.host}:${dest.port}:${source.host}:${source.port}`
          );
          return res;
        },
        []
      ),
      "-i",
      key,
      `${user}@${host}`
    ],
    cxt
  );
};

const frame = async (tunnelid, mode, args, cxt) => {
  const op = await OperationUtils.start(
    tunnelid,
    {
      start: async (operation, cxt) => {
        cxt.logger.debug("tunnel.start", {
          tunnelid,
          mode,
          args
        });

        operation.data.promise = spawn("ssh", args);

        cxt.logger.debug("tunnel.start.pid", {
          pid: operation.data.promise.childProcess.pid
        });

        await operation.data.promise;
      },
      stop: async (operation, cxt) => {
        const {
          data: {
            promise: {
              childProcess: { pid }
            }
          }
        } = operation;

        cxt.logger.debug("tunnel.stopping", {
          tunnelid,
          pid
        });

        const pkill = new Promise(function(resolve, reject) {
          kill(pid, err => {
            if (err) {
              cxt.logger.error("tunnel.stop.error", {
                error: err.toString(),
                pid
              });
            }

            cxt.logger.debug("tunnel.stopped", {
              tunnelid,
              pid
            });
            operation.change(OperationUtils.Status.stopped);
            resolve(operation);
          });
        });

        await pkill;
        await Utils.Process.wait(1000);
      },
      retry: async (operation, error, i, cxt) => {
        if (error !== null && i < 5) {
          await Utils.Process.wait(2500);
          cxt.logger.debug("tunnel.recover", {
            tunnelid,
            attempt: i
          });
          return true;
        } else {
          cxt.logger.debug("tunnel.giveup", {
            tunnelid,
            attempt: i
          });
          return false;
        }
      }
    },
    {},
    cxt
  );

  return op;
};

export const stop = async (tunnel, cxt) => {
  return await OperationUtils.stop(tunnel, {}, cxt);
};
