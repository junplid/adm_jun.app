import { styled } from "styled-components";

export const Content = styled.div``;

export const ContainerMessageBubble = styled.div`
  padding: 9px;
  padding-right: 5px;
  background: #1b2435;
  box-shadow: inset 0 0 3px #0000006c;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  gap: 3px;
`;

export const MessageBubble = styled.div`
  display: grid;
  align-items: center;
  grid-template-columns: 1fr 30px;
  &:first-child p {
    border-radius: 0 8px 8px 8px;
  }
  button {
    width: 100%;
    display: flex;
    justify-content: center;
    path,
    rect {
      color: #fff;
    }
    &:hover {
      path,
      rect {
        transition: 0.2s ease;
        color: #e85353;
      }
    }
  }
`;

export const Message = styled.p`
  font-weight: 400;
  color: #efefef !important;
  font-size: 9px;
  background: #153134;
  box-shadow: 0 1px 1px #0707071d;
  padding: 7px;
  padding-right: 17px;
  border-radius: 10px;
  line-height: 1.3;
`;
