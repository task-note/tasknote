import { getNodeType, mergeAttributes, Node } from "@tiptap/core";
import { Fragment, Slice } from "prosemirror-model";
import { Selection, TextSelection } from "prosemirror-state";
import { joinBackward } from "../commands/joinBackward";
import { findBlock } from "../helpers/findBlock";
import { setBlockHeading } from "../helpers/setBlockHeading";
import { getSplittedAttributes } from "../helpers/getSplittedAttributes";
import { OrderedListPlugin } from "../OrderedListPlugin";
import { PreviousBlockTypePlugin } from "../PreviousBlockTypePlugin";
import { textblockTypeInputRuleSameNodeType } from "../rule";
import styles from "./Block.module.css";
import { canSplit } from "prosemirror-transform";

export interface IBlock {
  HTMLAttributes: Record<string, any>;
}

export type Level = 1 | 2 | 3;
export type ListType = "li" | "oli" | "check";

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    blockHeading: {
      /**
       * Set a heading node
       */
      setBlockHeading: (attributes: { level: Level }) => ReturnType;
      /**
       * Unset a heading node
       */
      unsetBlockHeading: () => ReturnType;

      unsetList: () => ReturnType;

      addNewBlockAsSibling: (attributes?: {
        headingType?: Level;
        listType?: ListType;
      }) => ReturnType;

      setBlockList: (type: ListType) => ReturnType;
    };
  }
}

/**
 * The main "Block node" documents consist of
 */
export const Block = Node.create<IBlock>({
  name: "block",
  group: "block",
  addOptions() {
    return {
      HTMLAttributes: {},
    };
  },

  // A block always contains content, and optionally a blockGroup which contains nested blocks
  content: "content description* blockgroup?",

  defining: true,

  addAttributes() {
    return {
      listType: {
        default: undefined,
        renderHTML: (attributes) => {
          return {
            "data-listType": attributes.listType,
          };
        },
        parseHTML: (element) => element.getAttribute("data-listType"),
      },
      blockColor: {
        default: undefined,
        renderHTML: (attributes) => {
          return {
            "data-blockColor": attributes.blockColor,
          };
        },
        parseHTML: (element) => element.getAttribute("data-blockColor"),
      },
      blockStyle: {
        default: undefined,
        renderHTML: (attributes) => {
          return {
            "data-blockStyle": attributes.blockStyle,
          };
        },
        parseHTML: (element) => element.getAttribute("data-blockStyle"),
      },
      headingType: {
        default: undefined,
        keepOnSplit: false,
        renderHTML: (attributes) => {
          return {
            "data-headingType": attributes.headingType,
          };
        },
        parseHTML: (element) => element.getAttribute("data-headingType"),
      },
      dataValue: {
        default: false,
        keepOnSplit: false,
        renderHTML: (attributes) => {
          return {
            "data-value": attributes.dataValue,
          };
        },
        parseHTML: (element) => element.getAttribute("data-value"),
      },
    };
  },

  // TODO: should we parse <li>, <ol>, <h1>, etc?
  parseHTML() {
    return [
      {
        tag: "div",
      },
    ];
  },

  renderHTML() {
    return ["div"];
  },

  addNodeView() {
    return ({ HTMLAttributes, getPos, editor }) => {
      //console.log("-->", HTMLAttributes);
      const blockItem = document.createElement("div");
      const outerAttrib = mergeAttributes(
        this.options.HTMLAttributes,
        HTMLAttributes,
        {
          class: styles.blockOuter,
        }
      );
      Object.entries(outerAttrib).forEach(([key, value]) => {
        if (value) {
          blockItem.setAttribute(key, value);
        }
      });

      const content = document.createElement("div");
      const innerAttrib = mergeAttributes(
        this.options.HTMLAttributes,
        HTMLAttributes,
        {
          class: styles.block,
        }
      );
      Object.entries(innerAttrib).forEach(([key, value]) => {
        if (value) {
          content.setAttribute(key, value);
        }
      });

      if (HTMLAttributes["data-listType"] === "check") {
        const checkbox = document.createElement("input");
        checkbox.contentEditable = "false";
        checkbox.type = "checkbox";
        if (HTMLAttributes["data-value"] === true) {
          checkbox.checked = HTMLAttributes["data-value"];
        }
        checkbox.setAttribute("class", styles.blockCheck);
        checkbox.addEventListener("change", (event) => {
          // if the editor isn’t editable and we don't have a handler for
          // readonly checks we have to undo the latest change
          if (!editor.isEditable) {
            checkbox.checked = !checkbox.checked;

            return;
          }

          const { checked } = event.target as any;

          if (editor.isEditable && typeof getPos === "function") {
            editor
              .chain()
              .focus(undefined, { scrollIntoView: false })
              .command(({ tr }) => {
                const position = getPos();
                const currentNode = tr.doc.nodeAt(position);
                const data_val = {
                  dataValue: checked,
                };

                tr.setNodeMarkup(position, undefined, {
                  ...currentNode?.attrs,
                  ...data_val,
                });
                if (currentNode) {
                  let firstChildSize = 0;
                  if (currentNode.firstChild) {
                    firstChildSize = currentNode.firstChild?.nodeSize;
                  }
                  //console.log("-->", firstChildSize);
                  const mark = editor.schema.mark("strike");
                  const italic = editor.schema.mark("italic");
                  const endPos = position + firstChildSize;
                  if (checked) {
                    tr.addMark(position + 2, endPos, mark);
                    tr.addMark(position + 2, endPos, italic);
                  } else {
                    tr.removeMark(position + 2, endPos, mark);
                    tr.removeMark(position + 2, endPos, italic);
                  }
                }

                return true;
              })
              .run();
          }
        });

        blockItem.appendChild(checkbox);
      }
      blockItem.appendChild(content);
      return {
        dom: blockItem,
        contentDOM: content,
      };
    };
  },

  addInputRules() {
    return [
      ...[1, 2, 3].map((level) => {
        // Create a heading when starting with "#", "##", or "###""
        return textblockTypeInputRuleSameNodeType({
          find: new RegExp(`^(#{1,${level}})\\s$`),
          type: this.type,
          getAttributes: {
            headingType: level,
          },
        });
      }),
      // Create a list when starting with "-"
      textblockTypeInputRuleSameNodeType({
        find: /^\s*([-+*])\s$/,
        type: this.type,
        getAttributes: {
          listType: "li",
        },
      }),
      textblockTypeInputRuleSameNodeType({
        find: new RegExp(/^1.\s/),
        type: this.type,
        getAttributes: {
          listType: "oli",
        },
      }),
      // Create checkbox when starting with "[] "
      textblockTypeInputRuleSameNodeType({
        find: new RegExp(/^\s*(\[\])\s$/),
        type: this.type,
        getAttributes: {
          listType: "check",
        },
      }),
    ];
  },

  addCommands() {
    return {
      setBlockHeading:
        (attributes) =>
        ({ tr, dispatch }) => {
          return setBlockHeading(tr, dispatch, attributes.level);
        },
      unsetBlockHeading:
        () =>
        ({ tr, dispatch }) => {
          return setBlockHeading(tr, dispatch, undefined);
        },
      unsetList:
        () =>
        ({ tr, dispatch }) => {
          const node = tr.selection.$anchor.node(-1);
          const nodePos = tr.selection.$anchor.posAtIndex(0, -1) - 1;

          // const node2 = tr.doc.nodeAt(nodePos);
          if (node.type.name === "block" && node.attrs["listType"]) {
            if (dispatch) {
              tr.setNodeMarkup(nodePos, undefined, {
                ...node.attrs,
                listType: undefined,
              });
              return true;
            }
          }
          return false;
        },

      addNewBlockAsSibling:
        (attributes) =>
        ({ tr, dispatch, state }) => {
          // Get current block
          const currentBlock = findBlock(tr.selection);
          if (!currentBlock) {
            return false;
          }

          // If current blocks content is empty dont create a new block
          if (currentBlock.node.firstChild?.textContent.length === 0) {
            if (dispatch) {
              tr.setNodeMarkup(currentBlock.pos, undefined, attributes);
            }
            return true;
          }

          // Create new block after current block
          const endOfBlock = currentBlock.pos + currentBlock.node.nodeSize;
          let newBlock = state.schema.nodes["block"].createAndFill(attributes)!;
          if (dispatch) {
            tr.insert(endOfBlock, newBlock);
            tr.setSelection(new TextSelection(tr.doc.resolve(endOfBlock + 1)));
          }
          return true;
        },
      setBlockList:
        (type) =>
        ({ tr, dispatch }) => {
          const node = tr.selection.$anchor.node(-1);
          const nodePos = tr.selection.$anchor.posAtIndex(0, -1) - 1;

          // const node2 = tr.doc.nodeAt(nodePos);
          if (node.type.name === "block") {
            let childNode = node.firstChild;
            if (type !== "oli" && childNode) {
              let newAttrs = { ...childNode.attrs };
              delete newAttrs["position"];
              tr.setNodeMarkup(nodePos + 1, undefined, {
                ...newAttrs,
              });
            }

            if (dispatch) {
              tr.setNodeMarkup(nodePos, undefined, {
                ...node.attrs,
                listType: type,
              });
            }
            return true;
          }
          return false;
        },
      joinBackward:
        () =>
        ({ view, dispatch, state }) =>
          joinBackward(state, dispatch, view), // Override default joinBackward with edited command
    };
  },
  addProseMirrorPlugins() {
    return [PreviousBlockTypePlugin(), OrderedListPlugin()];
  },
  addKeyboardShortcuts() {
    // handleBackspace is partially adapted from https://github.com/ueberdosis/tiptap/blob/ed56337470efb4fd277128ab7ef792b37cfae992/packages/core/src/extensions/keymap.ts
    const handleBackspace = () =>
      this.editor.commands.first(({ commands }) => [
        // Maybe the user wants to undo an auto formatting input rule (e.g.: - or #, and then hit backspace) (source: tiptap)
        () => commands.undoInputRule(),
        // maybe convert first text block node to default node (source: tiptap)
        () =>
          commands.command(({ tr }) => {
            const { selection, doc } = tr;
            const { empty, $anchor } = selection;
            const { pos, parent } = $anchor;
            const isAtStart = Selection.atStart(doc).from === pos;

            if (
              !empty ||
              !isAtStart ||
              !parent.type.isTextblock ||
              parent.textContent.length
            ) {
              return false;
            }

            return commands.clearNodes();
          }),
        () => commands.deleteSelection(), // (source: tiptap)
        () =>
          commands.command(({ tr }) => {
            const isAtStartOfNode = tr.selection.$anchor.parentOffset === 0;
            const node = tr.selection.$anchor.node(-1);
            if (isAtStartOfNode && node.type.name === "block") {
              // we're at the start of the block, so we're trying to "backspace" the bullet or indentation
              return commands.first([
                () => commands.unsetList(), // first try to remove the "list" property
                () => commands.liftListItem("block"), // then try to remove a level of indentation
              ]);
            }
            return false;
          }),
        ({ chain }) =>
          // we are at the start of a block at the root level. The user hits backspace to "merge it" to the end of the block above
          //
          // BlockA
          // BlockB

          // Becomes:

          // BlockABlockB

          chain()
            .command(({ tr, state, dispatch }) => {
              const isAtStartOfNode = tr.selection.$anchor.parentOffset === 0;
              const anchor = tr.selection.$anchor;
              const node = anchor.node(-1);
              if (isAtStartOfNode && node.type.name === "block") {
                if (node.childCount === 2) {
                  // BlockB has children. We want to go from this:
                  //
                  // BlockA
                  // BlockB
                  //    BlockC
                  //        BlockD
                  //
                  // to:
                  //
                  // BlockABlockB
                  // BlockC
                  //     BlockD

                  // This parts moves the children of BlockB to the top level
                  const startSecondChild = anchor.posAtIndex(1, -1) + 1; // start of blockgroup
                  const endSecondChild = anchor.posAtIndex(2, -1) - 1;
                  const range = state.doc
                    .resolve(startSecondChild)
                    .blockRange(state.doc.resolve(endSecondChild));

                  if (dispatch) {
                    tr.lift(range!, anchor.depth - 2);
                  }
                }
                return true;
              }
              return false;
            })
            // use joinBackward to merge BlockB to BlockA (i.e.: turn it into BlockABlockB)
            // The standard JoinBackward would break here, and would turn it into:
            // BlockA
            //     BlockB
            //
            // joinBackward has been patched with our custom version to fix this (see commands/joinBackward)
            .joinBackward()
            .run(),

        () => commands.selectNodeBackward(), // (source: tiptap)
      ]);

    const handleSoftEnter = () =>
      this.editor.commands.first(() => [
        ({ tr, state, dispatch, editor }) => {
          const type = getNodeType("block", state.schema);
          const { $from, $to } = state.selection;
          // @ts-ignore
          // eslint-disable-next-line
          const node: ProseMirrorNode = state.selection.node;

          if (
            (node && node.isBlock) ||
            $from.depth < 2 ||
            !$from.sameParent($to)
          ) {
            return false;
          }

          const grandParent = $from.node(-1);

          if (grandParent.type !== type) {
            return false;
          }

          const extensionAttributes = editor.extensionManager.attributes;
          if (
            $from.parent.content.size === 0 &&
            $from.node(-1).childCount === $from.indexAfter(-1)
          ) {
            // In an empty block. If this is a nested list, the wrapping
            // list item should be split. Otherwise, bail out and let next
            // command handle lifting.
            if (
              $from.depth === 2 ||
              $from.node(-3).type !== type ||
              $from.index(-2) !== $from.node(-2).childCount - 1
            ) {
              return false;
            }

            if (dispatch) {
              let wrap = Fragment.empty;
              // eslint-disable-next-line
              const depthBefore = $from.index(-1) ? 1 : $from.index(-2) ? 2 : 3;

              // Build a fragment containing empty versions of the structure
              // from the outer list item to the parent node of the cursor
              for (
                let d = $from.depth - depthBefore;
                d >= $from.depth - 3;
                d -= 1
              ) {
                wrap = Fragment.from($from.node(d).copy(wrap));
              }

              // eslint-disable-next-line
              const depthAfter =
                $from.indexAfter(-1) < $from.node(-2).childCount
                  ? 1
                  : $from.indexAfter(-2) < $from.node(-3).childCount
                  ? 2
                  : 3;

              // Add a second list item with an empty default start node
              const newNextTypeAttributes = getSplittedAttributes(
                extensionAttributes,
                $from.node().type.name,
                $from.node().attrs
              );
              const nextType =
                type.contentMatch.defaultType?.createAndFill(
                  newNextTypeAttributes
                ) || undefined;

              wrap = wrap.append(
                Fragment.from(type.createAndFill(null, nextType) || undefined)
              );

              const start = $from.before($from.depth - (depthBefore - 1));

              tr.replace(
                start,
                $from.after(-depthAfter),
                new Slice(wrap, 4 - depthBefore, 0)
              );

              let sel = -1;

              tr.doc.nodesBetween(start, tr.doc.content.size, (n, pos) => {
                if (sel > -1) {
                  return false;
                }

                if (n.isTextblock && n.content.size === 0) {
                  sel = pos + 1;
                }
                return true;
              });

              if (sel > -1) {
                tr.setSelection(TextSelection.near(tr.doc.resolve(sel)));
              }

              tr.scrollIntoView();
            }

            return true;
          }

          const nextType = getNodeType("description", state.schema);

          const newNextTypeAttributes = getSplittedAttributes(
            extensionAttributes,
            $from.node().type.name,
            $from.node().attrs
          );

          tr.delete($from.pos, $to.pos);

          const types = [
            { type: nextType, attrs: newNextTypeAttributes },
            { type: nextType, attrs: newNextTypeAttributes },
          ];

          if (!canSplit(tr.doc, $from.pos, 2)) {
            return false;
          }

          if (dispatch) {
            tr.split($from.pos, 1, types).scrollIntoView();
          }

          return true;
        },
      ]);

    const handleEnter = () =>
      this.editor.commands.first(({ commands }) => [
        // Try to split the current block into 2 items:
        () => commands.splitListItem("block"),
        // Otherwise, maybe we are in an empty list item. "Enter" should remove the list bullet
        ({ tr, state, dispatch, editor }) => {
          const $from = tr.selection.$from;
          const extensionAttributes = editor.extensionManager.attributes;
          const node = tr.selection.$anchor.node(-1);
          if (node.childCount >= 2) {
            const nextType = getNodeType("content", state.schema);
            const newNextTypeAttributes = getSplittedAttributes(
              extensionAttributes,
              $from.node().type.name,
              $from.node().attrs
            );
            const types = [
              { type: node.type, attrs: node.attrs },
              { type: nextType, attrs: newNextTypeAttributes },
            ];
            if (dispatch) {
              tr.split($from.pos, 2, types).scrollIntoView();
            }
            return true;
          }

          if ($from.depth !== 3) {
            // only needed at root level, at deeper levels it should be handled already by splitListItem
            return false;
          }
          const nodePos = tr.selection.$anchor.posAtIndex(0, -1) - 1;

          if (node.type.name === "block" && node.attrs["listType"]) {
            if (dispatch) {
              tr.setNodeMarkup(nodePos, undefined, {
                ...node.attrs,
                listType: undefined,
              });
            }
            return true;
          }
          return false;
        },
        // Otherwise, we might be on an empty line and hit "Enter" to create a new line:
        ({ tr, dispatch }) => {
          const $from = tr.selection.$from;

          if (dispatch) {
            tr.split($from.pos, 2).scrollIntoView();
          }
          return true;
        },
      ]);

    return {
      Backspace: handleBackspace,
      Enter: handleEnter,
      Tab: () => this.editor.commands.sinkListItem("block"),
      "Shift-Enter": handleSoftEnter,
      "Shift-Tab": () => {
        return this.editor.commands.liftListItem("block");
      },
      "Mod-Alt-0": () =>
        this.editor.chain().unsetList().unsetBlockHeading().run(),
      "Mod-Alt-1": () => this.editor.commands.setBlockHeading({ level: 1 }),
      "Mod-Alt-2": () => this.editor.commands.setBlockHeading({ level: 2 }),
      "Mod-Alt-3": () => this.editor.commands.setBlockHeading({ level: 3 }),
      "Mod--": () => this.editor.commands.setBlockList("li"),
      "Mod-1": () => this.editor.commands.setBlockList("oli"),
      "Mod-[": () => this.editor.commands.setBlockList("check"),
      "Mod-]": () => this.editor.commands.setBlockList("check"),
      // TODO: Add shortcuts for numbered and bullet list
    };
  },
});
