const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env.other") });
const UInt8ToString = require("./utils.js").UInt8ToString;
const secondsToDate = require("./utils.js").secondsToDate;
const log = require("./utils.js").handleLog;
const sleep = require("./utils.js").sleep;
const TextDecoder = require("text-encoding").TextDecoder;
const prompt = require("prompt");

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

const specialChar = "ℏ";

const init = async (topicId) => {
  try {
    new MirrorConsensusTopicQuery()
      .setTopicId(topicId)
      .subscribe(mirrorNodeAddress, (res) => {
        const message = new TextDecoder("utf-8").decode(res["message"]);
        console.log(message.split(specialChar)[2]);
      });
    console.log("MirrorConsensusTopicQuery()", topicId.toString());
  } catch (error) {
    console.log("ERROR: MirrorConsensusTopicQuery()", error);
    process.exit(1);
  }
};

prompt.get("topicId", (err, res) => {
  if (err) {
    console.log(err);
    process.exit(1);
  }
  init(res.topicId);
});
