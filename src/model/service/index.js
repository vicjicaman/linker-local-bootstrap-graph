import uuidv4 from "uuid/v4";
import fs from "fs";
import path from "path";
import * as JsonUtils from "PKG/linker-json";

import * as Handler from "./handler";

export const start = async cxt => {
  const { workspace } = cxt;

  const instanceFile = path.join(workspace, "instance.json");

  if (!fs.existsSync(instanceFile)) {
    JsonUtils.save(instanceFile, { id: uuidv4(), token: null });
  }
  const { id } = JsonUtils.load(instanceFile);
  cxt.logger.debug("instance.current", { id });
  const instance = {
    id,
    instanceid: `repoflow-local-${id}`,
    network: {
      networkid: `repoflow-linker-network-${id}`
    }
  };

  instance.handler = await Handler.start(instance, cxt);

  return instance;
};
