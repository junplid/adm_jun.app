import { styled } from "styled-components";
// import { FiCopy } from "react-icons/fi";
import { RiDeleteBinLine } from "react-icons/ri";
import { FC, JSX } from "react";
import useStore from "../../flowStore";

const Button = styled.button`
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;

  &:first-child {
    svg {
      fill: #fff;
    }
    &:hover {
      svg {
        transition: 0.2s ease;
        fill: #e85353;
      }
    }
  }
  /* &:last-child {
    path,
    rect {
      color: #fff;
    }
    &:hover {
      path,
      rect {
        transition: 0.2s ease;
        color: #2e83e4;
      }
    }
  } */
`;

export const ActionsNodeComponent: FC<{ id: string }> = (
  props
): JSX.Element => {
  const deleteNode = useStore((s) => s.delNode);

  // const duplicateNode = () => {
  //   const { nodeInternals } = store.getState();
  //   const tempNode = Array.from(nodeInternals.values());

  //   setNodes([
  //     ...tempNode,
  //     {
  //       ...tempNode.filter((n) => n.id === props.id)[0],
  //       id: `${Math.floor(Math.random() * 9999999)}`,
  //       selected: false,
  //       position: {
  //         x: tempNode.filter((n) => n.id === props.id)[0].position.x + 250,
  //         y: tempNode.filter((n) => n.id === props.id)[0].position.y,
  //       },
  //     },
  //   ]);
  // };

  return (
    <div>
      <Button onClick={() => deleteNode(props.id)}>
        <RiDeleteBinLine size={11} />
      </Button>
      {/* <Button onClick={duplicateNode}>
        <FiCopy size={14} />
      </Button> */}
    </div>
  );
};
