import { FC, ReactNode } from "react";
import { styled } from "styled-components";
import "./styles.css";
import { useColorModeValue } from "@components/ui/color-mode";
import { VStack } from "@chakra-ui/react";

const Container = styled.div<{ size: string }>`
  width: ${({ size }) => size};

  :hover .action__node {
    top: -57px !important;
  }
`;

const Header = styled.div`
  position: absolute;
  top: 3px;
  left: 0;
  text-align: center;
  width: 100%;
  pointer-events: none;
  display: flex;
  flex-direction: column;
  /* margin-top: 3px; */
  gap: 0.5px;
`;

const NameNode = styled.span`
  font-weight: 600;
  line-height: 10px;
  font-size: 9px;
`;

const DescriptionNode = styled.span`
  line-height: 10px;
  font-size: 8px;
`;

const Content = styled.div`
  padding: 7px;
  border-radius: 3px;
  position: relative;
`;

interface PropsPatternNodeComponent {
  size?: string;
  nameNode: string;
  descriptionNode?: string;
  children: ReactNode;
  isConnectable?: boolean;
}

export const PatternNodeComponent: FC<PropsPatternNodeComponent> = ({
  size = "70px",
  isConnectable = true,
  ...props
}) => {
  const bgContainer = useColorModeValue("#eeeeee", "#151516");
  const boderColor = useColorModeValue("#e0e0e0", "#242428");
  const colorName = useColorModeValue("#232222", "#fbfbfb");
  const colorDesc = useColorModeValue("#676565", "#bcbcbc");

  return (
    <VStack alignItems={"baseline"} gap={0}>
      <Container className={isConnectable ? "" : "not-connectable"} size={size}>
        <Content
          style={{
            background: bgContainer,
            borderColor: boderColor,
            borderWidth: 0.5,
          }}
        >
          {props.children}
        </Content>
      </Container>
      <div style={{ position: "relative", width: "100%" }}>
        <Header>
          <NameNode style={{ color: colorName }}>{props.nameNode}</NameNode>
          <DescriptionNode style={{ color: colorDesc }}>
            {props.descriptionNode}
          </DescriptionNode>
        </Header>
      </div>
    </VStack>
  );
};
