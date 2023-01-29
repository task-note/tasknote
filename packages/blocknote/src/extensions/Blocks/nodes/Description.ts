import { mergeAttributes, Node } from "@tiptap/core";
import styles from "./Block.module.css";

export interface IBlock {
  HTMLAttributes: Record<string, any>;
}

export const DescBlock = Node.create<IBlock>({
  name: "description",

  addOptions() {
    return {
      HTMLAttributes: {},
    };
  },
  addAttributes() {
    return {
      position: {
        default: undefined,
        renderHTML: (attributes) => {
          return {
            "data-position": attributes.position,
          };
        },
        parseHTML: (element) => element.getAttribute("data-position"),
      },
    };
  },

  content: "inline*",

  parseHTML() {
    return [
      {
        tag: "div",
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    // TODO: The extra nested div is only needed for placeholders, different solution (without extra div) would be preferable
    // We can't use the other div because the ::before attribute on that one is already reserved for list-bullets
    return [
      "div",
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        class: styles.blockDesc,
      }),
      ["blockquote", 0],
    ];
  },
});
