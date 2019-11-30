import { execSync } from "child_process";
import fs from "fs";
import _ from "lodash";
import path from "path";
import * as Template from "./template";
import * as Utils from "@nebulario/linker-utils";

const networkInspect = async (networkid, cxt) =>
  JSON.parse(execSync(`docker network inspect ${networkid}`));

const getServiceNetwork = async (networkid, service, cxt) => {
  let networkInfo = null;

  const inspect = await networkInspect(networkid, cxt);

  while (networkInfo === null) {
    const inspectInitial = await networkInspect(networkid, cxt);

    networkInfo =
      _.find(inspect[0].Containers, c => c.Name.indexOf(service) !== -1) ||
      null;

    cxt.logger.debug("instance.network.service.raw", {
      container: networkInfo
    });

    await Utils.Process.wait(500);
  }

  const info = {
    ip: networkInfo.IPv4Address.split("/")[0]
  };

  cxt.logger.debug("instance.network.service", {
    service,
    info
  });
  return info;
};

export const start = async (instance, cxt) => {
  const {
    instanceid,
    network: { networkid }
  } = instance;
  const networksList = execSync(`docker network ls`).toString();

  if (networksList.indexOf(networkid) === -1) {
    cxt.logger.debug("network.create", { networkid });
    execSync(`docker network create ${networkid}`);
  }

  const inspect = await networkInspect(networkid, cxt);
  const localhost = inspect[0].IPAM.Config[0].Gateway;
  instance.network.localhost = localhost;

  cxt.logger.debug("instance.network", { networkid, localhost });

  const folder = path.join(cxt.workspace, "handler");
  const composeFile = path.join(folder, "docker-compose.yml");
  const handler = {
    paths: {
      folder,
      composeFile
    }
  };

  if (!fs.existsSync(handler.paths.folder)) {
    fs.mkdirSync(handler.paths.folder);
  }

  const content = Template.compose(
    instance,
    cxt
  );
  fs.writeFileSync(handler.paths.composeFile, content);

  execSync(`docker-compose -p ${instanceid} up -d`, {
    cwd: handler.paths.folder
  }).toString();
  cxt.logger.debug("instance.compose");

  instance.network.graph = await getServiceNetwork(networkid, "graph", cxt);

  instance.network.web = await getServiceNetwork(networkid, "web", cxt);

  return {};
};

/*

[
    {
        "Name": "repoflow-linker-network-c5f9c499-ecf2-4ee0-ae7c-9ac2e58e18fc",
        "Id": "cb383dd1fab6a627de839af93bb703ba3905ad1bd700202e827bf87a8a5250ec",
        "Created": "2019-11-27T20:15:15.885727536+01:00",
        "Scope": "local",
        "Driver": "bridge",
        "EnableIPv6": false,
        "IPAM": {
            "Driver": "default",
            "Options": {},
            "Config": [
                {
                    "Subnet": "172.29.0.0/16",
                    "Gateway": "172.29.0.1"
                }
            ]
        },
        "Internal": false,
        "Attachable": false,
        "Ingress": false,
        "ConfigFrom": {
            "Network": ""
        },
        "ConfigOnly": false,
        "Containers": {},
        "Options": {},
        "Labels": {}
    }
]

*/
