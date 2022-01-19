const execa = require("execa");
const fs = require("fs");

async function getGitDescribe() {
  const { stdout } = await execa(
    "git",
    ["describe", "--long", "--always", "--dirty", "--broken"],
    {
      reject: false,
    }
  );

  return stdout.trim();
}

async function gitLogFormat(format) {
  const { stdout } = await execa("git", ["log", "-1", `--format=${format}`], {
    reject: false,
  });

  return stdout.trim();
}

async function execaHelper(cmd, args = []) {
  const { stdout } = await execa(cmd, args, {
    reject: false,
  });

  return stdout.trim();
}

// https://devhints.io/git-log-format
async function getGitInfo() {
  const authorName = await gitLogFormat("%an");
  const authorEmail = await gitLogFormat("%ae");
  const commitMessage = await gitLogFormat("%s");
  const commitHash = await gitLogFormat("%H");
  const commitTimestamp = parseInt(await gitLogFormat("%ct"), 10) * 1000;
  const description = await getGitDescribe();
  const dirty = description.includes("dirty");

  return {
    authorName,
    authorEmail,
    commitMessage,
    commitHash,
    commitTimestamp,
    description,
    dirty,
  };
}

module.exports = {
  async generateBuildInfo() {
    const buildInfo = {
      commit: await getGitInfo(),
      build: {
        user: await execaHelper("whoami"),
        host: await execaHelper("hostname"),
        timestamp: new Date().getTime(),
      },
    };

    fs.writeFileSync(
      "./build/build-info.json",
      JSON.stringify(buildInfo, null, 2) + "\n"
    );
  },
};
