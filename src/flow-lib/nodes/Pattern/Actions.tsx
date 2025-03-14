import { useReactFlow, useStoreApi } from "reactflow";
import { styled } from "styled-components";

import { FiCopy } from "react-icons/fi";
import { RiDeleteBinLine } from "react-icons/ri";
import { JSX } from "react";

interface PropsActionsNodeComponent_I {
  id: string;
}

const Container = styled.div`
  position: absolute;
  top: 0px;
  z-index: -1;
  height: 30px;
  width: 56px;
  left: 50%;
  transition: 0.2s ease;
  transform: translateX(-50%);
  padding-bottom: 5px;
`;

const Content = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 2px;
  padding: 1px 5px;
  border-radius: 8px;
  height: 100%;
  width: 100%;
  align-items: flex-start;
  background-color: #0d121b;
  box-shadow: 0 4px 4px #0d121b3d;
`;

const Button = styled.button`
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;

  &:last-child {
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
  &:first-child {
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
  }
`;

export const ActionsNodeComponent: React.FC<PropsActionsNodeComponent_I> = (
  props: PropsActionsNodeComponent_I
): JSX.Element => {
  const store = useStoreApi();
  const { setNodes, setEdges } = useReactFlow();

  const deleteNode = () => {
    const { nodeInternals, edges } = store.getState();
    setEdges(
      Array.from(edges.values()).filter(
        (n) => n.source !== props.id && n.target !== props.id
      )
    );
    setNodes(
      Array.from(nodeInternals.values()).filter((n) => n.id !== props.id)
    );
  };
  const duplicateNode = () => {
    const { nodeInternals } = store.getState();
    const tempNode = Array.from(nodeInternals.values());

    setNodes([
      ...tempNode,
      {
        ...tempNode.filter((n) => n.id === props.id)[0],
        id: `${Math.floor(Math.random() * 9999999)}`,
        selected: false,
        position: {
          x: tempNode.filter((n) => n.id === props.id)[0].position.x + 250,
          y: tempNode.filter((n) => n.id === props.id)[0].position.y,
        },
      },
    ]);
  };
  return (
    <Container className="action__node">
      <Content>
        <Button onClick={duplicateNode}>
          <FiCopy size={14} />
        </Button>
        <Button onClick={deleteNode}>
          <RiDeleteBinLine size={14} />
        </Button>
      </Content>
    </Container>
  );
};
