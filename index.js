const { spawnSync } = require("child_process");
const { writeFileSync, unlinkSync, readFileSync } = require("fs");
const visit = require("unist-util-visit");
const { ulid } = require("ulid");
const which = require("which");

function mermaid() {
  const npmPath = which.sync("npm");
  const mmdcPathWhich = spawnSync(npmPath, ["exec", "which", "mmdc"]);
  const mmdcPath = mmdcPathWhich.stdout.toString().trimEnd();

  return (ast) => visit(ast, "code", visitor);

  function visitor(node, index, parent) {
    if (!node.lang.startsWith("mermaid")) return;
    const tmpFilename = ulid();

    writeFileSync(`${tmpFilename}.mmd`, node.value);
    spawnSync(mmdcPath, [
      "-i",
      `${tmpFilename}.mmd`,
      "-o",
      `${tmpFilename}.svg`,
      "-b",
      "transparent",
    ]);

    const svg = readFileSync(`${tmpFilename}.svg`, "utf-8");

    const newNode = {
      type: "text",
      value: svg,
      position: node.position,
    };

    parent.children.splice(index, 1, newNode);

    unlinkSync(`${tmpFilename}.mmd`);
    unlinkSync(`${tmpFilename}.svg`);
  }
}

module.exports = mermaid;
