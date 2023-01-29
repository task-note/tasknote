import { Node } from "@tiptap/core";
import { Block } from "./nodes/Block";
import { BlockGroup } from "./nodes/BlockGroup";
import { ContentBlock } from "./nodes/Content";
import { DescBlock } from "./nodes/Description";

export const blocks: any[] = [
  DescBlock,
  ContentBlock,
  Block,
  BlockGroup,
  Node.create({
    name: "doc",
    topNode: true,
    content: "blockgroup",
  }),
];
