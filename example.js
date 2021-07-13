const unified = require("unified");
const toHTML = require("hast-util-to-html");
const toHAST = require("mdast-util-to-hast");
const toMDAST = require("remark-parse");
const vfile = require("vfile");
const mermaid = require("./index")

const fn = unified()
  .use(toMDAST)
  .use(mermaid);

async function parseFileToAst(file) {
  const internalAst = fn.parse(file);
  return await fn.run(internalAst, file);
}

const mermaidCodeBlock = `\`\`\`mermaid
graph TD;
    A-->B;
    A-->C;
    B-->D;
    C-->D;
\`\`\``;

(async () => {
  const file = vfile(mermaidCodeBlock);
  const ast = await parseFileToAst(file);
  const hast = toHAST(ast);
  const html = toHTML(hast);
  // TODO: dangerous
  console.log(html.replaceAll("&#x3C;", "<"))
})();
