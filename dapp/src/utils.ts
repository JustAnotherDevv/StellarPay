import axios from "axios";
import { SorobanRpc } from "@stellar/stellar-sdk";
import {
  Keypair,
  xdr,
  Address,
  Operation,
  TransactionBuilder,
  Account,
  scValToNative,
} from "@stellar/stellar-sdk";
import { splitterContract } from "./constants";

export const contractRead = async (
  bundlerKey: Keypair,
  //   accountContractId: string,
  functionName: string,
  functionArgs: any[]
) => {
  const key = bundlerKey;

  const op = Operation.invokeContractFunction({
    contract: splitterContract,
    function: functionName, //"votes",
    args: functionArgs,
    // [
    //   xdr.ScVal.scvAddress(Address.fromString(accountContractId).toScAddress()),
    // ],
  });

  const transaction = new TransactionBuilder(
    new Account(key.publicKey(), "0"),
    {
      fee: "0",
      networkPassphrase: import.meta.env.VITE_PUBLIC_networkPassphrase,
    }
  )
    .addOperation(op)
    .setTimeout(0)
    .build();

  const rpc = new SorobanRpc.Server(import.meta.env.VITE_PUBLIC_rpcUrl);

  const simResp = await rpc.simulateTransaction(transaction);

  if (!SorobanRpc.Api.isSimulationSuccess(simResp)) {
    throw simResp;
  } else {
    return simResp;
  }
};

export const fetchGroups = async () => {};

export const uploadImageToInfura = async (imageFile: any) => {
  const formData = new FormData();
  formData.append("file", imageFile);

  const infuraProjectId = import.meta.env.VITE_PUBLIC_INFURA_ID;
  const infuraProjectSecret = import.meta.env.VITE_PUBLIC_INFURA_SECRET;

  console.log(infuraProjectId, `\n`, infuraProjectSecret);

  try {
    const response = await axios.post(
      "https://ipfs.infura.io:5001/api/v0/add",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization:
            "Basic " +
            Buffer.from(infuraProjectId + ":" + infuraProjectSecret).toString(
              "base64"
            ),
        },
      }
    );

    console.log("Upload successful:", response.data);
    return response.data.Hash;
  } catch (error) {
    console.error("Error uploading to Infura:", error);
    throw error;
  }
};
export function truncateStr(str: string, n = 6) {
  if (!str) return "";
  return str.length > n
    ? str.substr(0, n - 1) + "..." + str.substr(str.length - n, str.length - 1)
    : str;
}
