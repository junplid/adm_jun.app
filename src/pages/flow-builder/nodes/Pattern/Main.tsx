import { FC, ReactNode } from "react";
import { styled } from "styled-components";
import "./styles.css";
import { useColorModeValue } from "@components/ui/color-mode";
import { VStack } from "@chakra-ui/react";

const Container = styled.div<{ size?: string }>`
  width: ${({ size }) => size || ""};

  :hover .action__node {
    top: -57px !important;
  }
`;

const Header = styled.div`
  position: absolute;
  top: 5px;
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
  padding: 6px;
  border-radius: 3px;
  position: relative;
`;

interface PropsPatternNodeComponent {
  size?: string;
  nameNode: string;
  descriptionNode?: string;
  children: ReactNode;
  isConnectable?: boolean;
  clickable?: boolean;
  open?: boolean;
}

export const PatternNodeComponent: FC<PropsPatternNodeComponent> = ({
  isConnectable = true,
  ...props
}) => {
  const bgContainer = useColorModeValue("#e0e0e0", "#151516");
  const boderColor = useColorModeValue("#b1b1b1", "#333335");
  const colorName = useColorModeValue("#1a1919", "#ffffff");
  const colorDesc = useColorModeValue("#7c7c7c", "#aaaaaa");

  return (
    <VStack className="group" alignItems={"baseline"} gap={0}>
      <Container
        className={isConnectable ? "" : "not-connectable"}
        size={props.size}
        style={{ cursor: props.clickable ? "pointer" : "" }}
      >
        <Content
          style={{
            background: bgContainer,
            borderColor: boderColor,
            borderWidth: 0.5,
          }}
          {...(props.clickable && {
            className:
              "dark:hover:!bg-[#1d1d1d] hover:!bg-[#e4e4e4] duration-300",
          })}
          {...(props.open && {
            className: "dark:!bg-[#1d1d1d] !bg-[#f0f0f0] duration-300",
          })}
        >
          {props.children}
        </Content>
      </Container>
      <div style={{ position: "relative", width: "100%" }}>
        <Header>
          <DescriptionNode style={{ color: colorDesc }}>
            {props.descriptionNode}
          </DescriptionNode>
          <NameNode style={{ color: colorName }}>{props.nameNode}</NameNode>
        </Header>
      </div>
    </VStack>
  );
};
