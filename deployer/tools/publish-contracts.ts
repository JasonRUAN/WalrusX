import { publishPackage } from "../utils/sui_utils";

(async () => {
  await publishPackage({
    packagePath: __dirname + "/../../contract/walrusx",
    network: "testnet",
    exportFileName: "sui-walrusx-contract",
  });
})();
