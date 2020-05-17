const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env.creator") });
const UInt8ToString = require("./utils.js").UInt8ToString;
const secondsToDate = require("./utils.js").secondsToDate;
const log = require("./utils.js").handleLog;
const sleep = require("./utils.js").sleep;
var qrcode = require("qrcode-terminal");
const TextDecoder = require("text-encoding").TextDecoder;
var Promise = require("promise");

const {
  Client,
  ConsensusSubmitMessageTransaction,
  ConsensusTopicId,
  ConsensusTopicCreateTransaction,
  MirrorClient,
  MirrorConsensusTopicQuery,
} = require("@hashgraph/sdk");

const mirrorNodeAddress = new MirrorClient(
  "hcs.testnet.mirrornode.hedera.com:5600"
);

var topicId = "";

var groupMemebers = [process.env.ACCOUNT_ID];

/* Set up the Hedera client for the testnet */
var HederaClient = Client.forTestnet();
HederaClient.setOperator(process.env.ACCOUNT_ID, process.env.PRIVATE_KEY);

/* Creat a new topic that can be for comunication between */
const createNewTopic = () => {
  return new Promise(async (resolve, reject) => {
    try {
      const txId = await new ConsensusTopicCreateTransaction().execute(
        HederaClient
      );
      await sleep(3000); // wait until Hedera reaches consensus
      const receipt = await txId.getReceipt(HederaClient);
      topicId = receipt.getTopicId();
      console.log(`success! new topic ${topicId}`);
      qrcode.generate(`RoomID:${topicId}`);
      resolve(topicId);
    } catch (error) {
      console.log(`ERROR [0]: ${error}`);
      process.exit(1);
    }
  });
};

/* Subscribe to the topic that was just created */
const subscribeToMirror = async () => {
  try {
    new MirrorConsensusTopicQuery()
      .setTopicId(topicId)
      .subscribe(mirrorNodeAddress, (res) => {
        const message = new TextDecoder("utf-8").decode(res["message"]);
        groupMemebers.push(message);
        console.log(`Added new member: ${message}`);
      });
  } catch (error) {
    log("ERROR: MirrorConsensusTopicQuery()", error, logStatus);
    process.exit(1);
  }
};

const init = async () => {
  await createNewTopic();
  subscribeToMirror();
};

init();
